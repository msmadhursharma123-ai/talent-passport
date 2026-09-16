package in.talentpassport.app;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

@CapacitorPlugin(name = "AndroidPdfSaver")
public class AndroidPdfSaverPlugin extends Plugin {

    private static final String DOWNLOAD_SUBDIRECTORY = "Talent Passport";

    @PluginMethod
    public void savePdf(PluginCall call) {
        final String requestedName = call.getString("fileName");
        final String base64 = call.getString("data");

        if (base64 == null || base64.isEmpty()) {
            call.reject("PDF data is empty.");
            return;
        }

        final String fileName = sanitizeFileName(requestedName);

        try {
            byte[] pdfBytes = Base64.decode(base64, Base64.DEFAULT);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                Uri uri = saveWithMediaStore(fileName, pdfBytes);
                JSObject result = new JSObject();
                result.put("uri", uri.toString());
                result.put("fileName", fileName);
                result.put("location", "Downloads/" + DOWNLOAD_SUBDIRECTORY);
                call.resolve(result);
                return;
            }

            // Android 9 and older: keep a persistent copy in the app's
            // external Downloads directory without requesting legacy storage
            // permissions. Modern supported Android versions use MediaStore
            // above and therefore save to the public Downloads collection.
            File baseDir = getContext().getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
            if (baseDir == null) {
                call.reject("Android Downloads directory is unavailable.");
                return;
            }

            File targetDir = new File(baseDir, DOWNLOAD_SUBDIRECTORY);
            if (!targetDir.exists() && !targetDir.mkdirs()) {
                call.reject("Unable to create the Talent Passport download folder.");
                return;
            }

            File targetFile = new File(targetDir, fileName);
            try (FileOutputStream output = new FileOutputStream(targetFile)) {
                output.write(pdfBytes);
                output.flush();
            }

            JSObject result = new JSObject();
            result.put("uri", Uri.fromFile(targetFile).toString());
            result.put("fileName", fileName);
            result.put("location", targetDir.getAbsolutePath());
            call.resolve(result);
        } catch (IllegalArgumentException error) {
            call.reject("The generated PDF data is invalid.", error);
        } catch (Exception error) {
            call.reject(
                error.getMessage() == null
                    ? "Unable to save the PDF to Android Downloads."
                    : error.getMessage(),
                error
            );
        }
    }

    private Uri saveWithMediaStore(String fileName, byte[] pdfBytes) throws Exception {
        ContentResolver resolver = getContext().getContentResolver();

        ContentValues values = new ContentValues();
        values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
        values.put(MediaStore.Downloads.MIME_TYPE, "application/pdf");
        values.put(
            MediaStore.Downloads.RELATIVE_PATH,
            Environment.DIRECTORY_DOWNLOADS + File.separator + DOWNLOAD_SUBDIRECTORY
        );
        values.put(MediaStore.Downloads.IS_PENDING, 1);

        Uri collection = MediaStore.Downloads.getContentUri(
            MediaStore.VOLUME_EXTERNAL_PRIMARY
        );

        Uri uri = resolver.insert(collection, values);
        if (uri == null) {
            throw new Exception("Android could not create the PDF download.");
        }

        boolean success = false;
        try {
            try (OutputStream output = resolver.openOutputStream(uri, "w")) {
                if (output == null) {
                    throw new Exception("Android could not open the PDF download for writing.");
                }
                output.write(pdfBytes);
                output.flush();
            }

            ContentValues publishValues = new ContentValues();
            publishValues.put(MediaStore.Downloads.IS_PENDING, 0);
            resolver.update(uri, publishValues, null, null);
            success = true;
            return uri;
        } finally {
            if (!success) {
                try {
                    resolver.delete(uri, null, null);
                } catch (Exception ignored) {
                    // Best-effort cleanup of a failed pending download.
                }
            }
        }
    }

    private String sanitizeFileName(String requestedName) {
        String name = requestedName == null ? "Talent-Passport.pdf" : requestedName.trim();
        name = name.replaceAll("[\\\\/:*?\"<>|]+", "-");
        if (name.isEmpty()) {
            name = "Talent-Passport.pdf";
        }
        if (!name.toLowerCase().endsWith(".pdf")) {
            name = name + ".pdf";
        }
        return name;
    }
}
