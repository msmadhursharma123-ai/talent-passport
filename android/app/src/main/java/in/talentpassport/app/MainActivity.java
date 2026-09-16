package in.talentpassport.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AndroidPdfSaverPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
