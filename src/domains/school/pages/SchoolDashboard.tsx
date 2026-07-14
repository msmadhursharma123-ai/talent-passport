interface Props {

    onLogout: () => void;

}

export default function SchoolDashboard({

    onLogout

}: Props) {

    return (

        <div
            style={{
                minHeight: "100vh",
                background: "#F4F7FC",
                padding: 24
            }}
        >

            <div
                style={{
                    background: "white",
                    borderRadius: 20,
                    padding: 20,
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    boxShadow: "0 4px 18px rgba(0,0,0,.06)"
                }}
            >

                <button
                    onClick={onLogout}
                    style={{
                        background: "#DC2626",
                        color: "white",
                        border: "none",
                        borderRadius: 10,
                        padding: "12px 24px",
                        fontWeight: 700,
                        cursor: "pointer"
                    }}
                >

                    Logout

                </button>

            </div>

            <div
                style={{
                    marginTop: 30,
                    background: "white",
                    borderRadius: 20,
                    padding: 50,
                    boxShadow: "0 4px 18px rgba(0,0,0,.06)"
                }}
            >

                <h1
                    style={{
                        marginTop: 0,
                        fontSize: 42,
                        color: "#143B73"
                    }}
                >

                    School Dashboard

                </h1>

                <p
                    style={{
                        fontSize: 18,
                        color: "#64748B"
                    }}
                >

                    School authentication successful.

                </p>

                <p
                    style={{
                        fontSize: 18,
                        color: "#64748B"
                    }}
                >

                    School Portal Phase 1 Completed.

                </p>

            </div>

        </div>

    );

}