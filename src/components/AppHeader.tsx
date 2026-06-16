import logo from "../assets/logo.png";

interface Props {
  children?: React.ReactNode;
}

export default function AppHeader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 24px",
        background: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",
      }}
    >
      <img
        src={logo}
        alt="Talent Passport"
        style={{
          height: "55px",
          objectFit: "contain",
        }}
      />
    </div>
  );
}