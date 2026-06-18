export default function StudentInsightPanel() {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid #E5E7EB",
      }}
    >
      <h3>Student Intelligence</h3>

      <div style={{ marginTop: "20px" }}>
        <strong>Talent Passport Score</strong>

        <div
          style={{
            fontSize: "42px",
            fontWeight: 700,
            color: "#143B73",
            marginTop: "8px",
          }}
        >
          82
        </div>
      </div>

      <hr />

      <div style={{ marginTop: "20px" }}>
        <div>Communication</div>
        <strong>84</strong>
      </div>

      <div style={{ marginTop: "12px" }}>
        <div>Confidence</div>
        <strong>79</strong>
      </div>

      <div style={{ marginTop: "12px" }}>
        <div>Leadership</div>
        <strong>72</strong>
      </div>

      <div style={{ marginTop: "12px" }}>
        <div>Critical Thinking</div>
        <strong>81</strong>
      </div>

      <div style={{ marginTop: "12px" }}>
        <div>Creativity</div>
        <strong>68</strong>
      </div>

      <div style={{ marginTop: "12px" }}>
        <div>Collaboration</div>
        <strong>74</strong>
      </div>

      <hr />

      <div style={{ marginTop: "20px" }}>
        <strong>Past Competitions</strong>

        <ul>
          <li>Debate Challenge</li>
          <li>News Anchor Challenge</li>
          <li>Social Impact Challenge</li>
        </ul>
      </div>
    </div>
  );
}