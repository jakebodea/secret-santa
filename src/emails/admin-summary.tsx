interface AdminSummaryProps {
  adminName: string
  resultsUrl: string
  partyName?: string
}

export default function AdminSummary({
  adminName,
  resultsUrl,
  partyName,
}: AdminSummaryProps) {
  return (
    <html>
      <head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        `}</style>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#faf9f7',
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        }}
      >
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{ backgroundColor: '#faf9f7' }}
        >
          <tr>
            <td align="center" style={{ padding: '40px 20px' }}>
              <table
                width="600"
                cellPadding="0"
                cellSpacing="0"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* Header */}
                <tr>
                  <td align="center" style={{ padding: '50px 40px 30px' }}>
                    <h1
                      style={{
                        margin: 0,
                        fontSize: '38px',
                        fontFamily: "'Instrument Serif', Georgia, serif",
                        color: '#331a0d',
                        fontWeight: 'normal',
                        letterSpacing: '-0.5px',
                      }}
                    >
                      Shhh...
                    </h1>
                  </td>
                </tr>

                {/* Greeting */}
                <tr>
                  <td align="center" style={{ padding: '0 40px 30px' }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '22px',
                        color: '#331a0d',
                        lineHeight: '1.5',
                        fontWeight: '500',
                      }}
                    >
                      Hi {adminName}!
                    </p>
                  </td>
                </tr>

                {/* Main message */}
                <tr>
                  <td align="center" style={{ padding: '0 40px 30px' }}>
                    <p
                      style={{
                        margin: '0 0 24px',
                        fontSize: '18px',
                        color: '#806656',
                        lineHeight: '1.7',
                        maxWidth: '520px',
                      }}
                    >
                      {partyName 
                        ? `The ${partyName} assignments have been generated and sent to all participants!`
                        : 'The Secret Santa assignments have been generated and sent to all participants!'}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '18px',
                        color: '#806656',
                        lineHeight: '1.7',
                        maxWidth: '520px',
                      }}
                    >
                      As the organizer, you have access to view all the assignments.
                    </p>
                  </td>
                </tr>

                {/* Warning box */}
                <tr>
                  <td align="center" style={{ padding: '0 40px 40px' }}>
                    <div
                      style={{
                        backgroundColor: '#fff9f0',
                        border: '3px solid #c9985a',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '480px',
                        margin: '0 auto',
                      }}
                    >
                      <p
                        style={{
                          margin: '0 0 12px',
                          fontSize: '16px',
                          color: '#8c3e2b',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        }}
                      >
                        Warning
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '15px',
                          color: '#806656',
                          lineHeight: '1.6',
                        }}
                      >
                        Clicking the button below will show all the results! Keep this secret to maintain the surprise!
                      </p>
                    </div>
                  </td>
                </tr>

                {/* Button */}
                <tr>
                  <td align="center" style={{ padding: '0 40px 40px' }}>
                    <a
                      href={resultsUrl}
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#8c3e2b',
                        color: '#ffffff',
                        textDecoration: 'none',
                        padding: '16px 40px',
                        borderRadius: '8px',
                        fontSize: '18px',
                        fontWeight: '500',
                        letterSpacing: '0.5px',
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
                      padding: '30px 40px 40px',
                      borderTop: '1px solid #e5ddd0',
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#806656',
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
  )
}

