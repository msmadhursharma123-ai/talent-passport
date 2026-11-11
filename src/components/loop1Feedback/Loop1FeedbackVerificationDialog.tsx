interface Props {
  open: boolean;
  onDecision: (wantsToCorrect: boolean) => void;
}

export default function Loop1FeedbackVerificationDialog({
  open,
  onDecision,
}: Props) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="loop1-verification-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(15, 23, 42, 0.52)",
      }}
    >
      <div
        style={{
          width: "min(100%, 460px)",
          background: "#FFFFFF",
          border: "1px solid #CBD5E1",
          borderRadius: 14,
          padding: "22px 20px",
          boxShadow: "0 18px 50px rgba(15, 23, 42, 0.18)",
        }}
      >
        <div
          id="loop1-verification-title"
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "#0F172A",
            marginBottom: 10,
            lineHeight: 1.35,
          }}
        >
         You correctly analysed the question from the topic ✅
        </div>
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.55,
            color: "#475569",
            marginBottom: 20,
          }}
        >
           Are you sure you didn't understand it well? Do you want to correct your feedback?
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => onDecision(false)}
            style={{
              minHeight: 42,
              padding: "9px 18px",
              borderRadius: 9,
              border: "1px solid #CBD5E1",
              background: "#FFFFFF",
              color: "#334155",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            NO
          </button>
          <button
            type="button"
            onClick={() => onDecision(true)}
            style={{
              minHeight: 42,
              padding: "9px 18px",
              borderRadius: 9,
              border: "1px solid #EA580C",
              background: "#F97316",
              color: "#FFFFFF",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            YES
          </button>
        </div>
      </div>
    </div>
  );
}
