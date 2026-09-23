interface AdminSummaryProps {
  adminName: string;
  resultsUrl: string;
  partyName?: string;
}

export default function AdminSummary({
  adminName,
  resultsUrl,
  partyName,
}: AdminSummaryProps) {
  return (
    <html lang="en">
      <head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        `}</style>
      </head>
      <body
        style={{
          backgroundColor: "#faf9f7",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{ backgroundColor: "#faf9f7" }}
        >
          <tr>
            <td align="center" style={{ padding: "40px 20px" }}>
              <table
                width="600"
                cellPadding="0"
                cellSpacing="0"
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Header */}
                <tr>
                  <td align="center" style={{ padding: "50px 40px 30px" }}>
                    <h1
                      style={{
                        color: "#331a0d",
                        fontFamily: "'Instrument Serif', Georgia, serif",
                        fontSize: "38px",
                        fontWeight: "normal",
                        letterSpacing: "-0.5px",
                        margin: 0,
                      }}
                    >
                      Shhh...
                    </h1>
                  </td>
                </tr>

                {/* Greeting */}
                <tr>
                  <td align="center" style={{ padding: "0 40px 30px" }}>
                    <p
                      style={{
                        color: "#331a0d",
                        fontSize: "22px",
                        fontWeight: "500",
                        lineHeight: "1.5",
                        margin: 0,
                      }}
                    >
                      Hi {adminName}!
                    </p>
                  </td>
                </tr>

                {/* Main message */}
                <tr>
                  <td align="center" style={{ padding: "0 40px 30px" }}>
                    <p
                      style={{
                        color: "#806656",
                        fontSize: "18px",
                        lineHeight: "1.7",
                        margin: "0 0 24px",
                        maxWidth: "520px",
                      }}
                    >
                      {partyName ? (
                        <>
                          The{" "}
                          <span
                            style={{
                              textDecoration: "underline",
                              textDecorationColor: "#8c3e2b",
                              textDecorationThickness: "4px",
                            }}
                          >
                            {partyName}
                          </span>{" "}
                          assignments have been generated and sent to all
                          participants!
                        </>
                      ) : (
                        "The Secret Santa assignments have been generated and sent to all participants!"
                      )}
                    </p>
                    <p
                      style={{
                        color: "#806656",
                        fontSize: "18px",
                        lineHeight: "1.7",
                        margin: 0,
                        maxWidth: "520px",
                      }}
                    >
                      As the organizer, you have access to view all the
                      assignments.
                    </p>
                  </td>
                </tr>

                {/* Warning box */}
                <tr>
                  <td align="center" style={{ padding: "0 40px 40px" }}>
                    <div
                      style={{
                        backgroundColor: "#fff9f0",
                        border: "3px solid #c9985a",
                        borderRadius: "12px",
                        margin: "0 auto",
                        maxWidth: "480px",
                        padding: "24px",
                      }}
                    >
                      <p
                        style={{
                          color: "#8c3e2b",
                          fontSize: "16px",
                          fontWeight: "bold",
                          letterSpacing: "1px",
                          margin: "0 0 12px",
                          textTransform: "uppercase",
                        }}
                      >
                        Warning
                      </p>
                      <p
                        style={{
                          color: "#806656",
                          fontSize: "15px",
                          lineHeight: "1.6",
                          margin: 0,
                        }}
                      >
                        Clicking the button below will show all the results!
                        Keep this secret to maintain the surprise!
                      </p>
                    </div>
                  </td>
                </tr>

                {/* Button */}
                <tr>
                  <td align="center" style={{ padding: "0 40px 40px" }}>
                    <a
                      href={resultsUrl}
                      style={{
                        backgroundColor: "#8c3e2b",
                        borderRadius: "8px",
                        color: "#ffffff",
                        display: "inline-block",
                        fontSize: "18px",
                        fontWeight: "500",
                        letterSpacing: "0.5px",
                        padding: "16px 40px",
                        textDecoration: "none",
                      }}
                    >
                      View All Assignments
                    </a>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td
                    align="center"
                    style={{
                      borderTop: "1px solid #e5ddd0",
                      padding: "30px 40px 40px",
                    }}
                  >
                    <p
                      style={{
                        color: "#806656",
                        fontSize: "14px",
                        margin: 0,
                      }}
                    >
                      Happy organizing! 🎄✨
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
