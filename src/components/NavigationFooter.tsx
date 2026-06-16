interface Props {
  onBack?: () => void;
  onNext?: () => void;
}

export default function NavigationFooter({
  onBack,
  onNext,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "40px",
      }}
    >
      <button
        onClick={onBack}
        disabled={!onBack}
      >
        ← Back
      </button>

      <button
        onClick={onNext}
        disabled={!onNext}
      >
        Next →
      </button>
    </div>
  );
}