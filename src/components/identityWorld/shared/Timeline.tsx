import COLORS from "../styles/colors";

export interface TimelineItem {

    title: string;

    description: string;

    icon?: string;

}

export interface TimelineProps {

    items: TimelineItem[];

}

export default function Timeline({

    items

}: TimelineProps) {

    return (

        <div

            style={{

                display: "grid",

                gap: 28

            }}

        >

            {

                items.map(

                    (item, index) => (

                        <div

                            key={item.title}

                            style={{

                                display: "grid",

                                gridTemplateColumns:

                                    "70px 1fr",

                                gap: 22,

                                alignItems: "flex-start"

                            }}

                        >

                            <div

                                style={{

                                    display: "flex",

                                    flexDirection: "column",

                                    alignItems: "center"

                                }}

                            >

                                <div

                                    style={{

                                        width: 58,

                                        height: 58,

                                        borderRadius: "50%",

                                        background:

                                            "linear-gradient(135deg,#2563EB,#3B82F6)",

                                        color: "#FFFFFF",

                                        display: "flex",

                                        alignItems: "center",

                                        justifyContent: "center",

                                        fontSize: 24,

                                        fontWeight: 700,

                                        boxShadow:

                                            "0 15px 40px rgba(37,99,235,.35)"

                                    }}

                                >

                                    {

                                        item.icon ??

                                        index + 1

                                    }

                                </div>

                                {

                                    index !==

                                    items.length - 1 && (

                                        <div

                                            style={{

                                                width: 3,

                                                flex: 1,

                                                minHeight: 60,

                                                background:

                                                    "rgba(255,255,255,.18)",

                                                marginTop: 10,

                                                borderRadius: 999

                                            }}

                                        />

                                    )

                                }

                            </div>

                            <div

                                style={{

                                    paddingTop: 6

                                }}

                            >

                                <div

                                    style={{

                                        color:

                                            COLORS.textPrimary,

                                        fontSize: 22,

                                        fontWeight: 700,

                                        marginBottom: 10

                                    }}

                                >

                                    {item.title}

                                </div>

                                <div

                                    style={{

                                        color:

                                            COLORS.textSecondary,

                                        lineHeight: 1.8,

                                        fontSize: 15

                                    }}

                                >

                                    {item.description}

                                </div>

                            </div>

                        </div>

                    )

                )

            }

        </div>

    );

}