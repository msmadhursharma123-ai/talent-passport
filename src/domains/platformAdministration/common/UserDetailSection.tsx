interface UserDetailSectionProps {

  title: string;

  children: React.ReactNode;

}

export default function UserDetailSection({

  title,

  children,

}: UserDetailSectionProps) {

  return (

    <section
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 14,
        padding: 20,
        marginBottom: 20,
      }}
    >

      <h3
        style={{
          margin: 0,
          marginBottom: 18,
          color: "#143B73",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        {title}
      </h3>

      {children}

    </section>

  );

}