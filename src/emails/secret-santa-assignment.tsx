interface SecretSantaAssignmentProps {
  giverName: string
  receiverName: string
  partyName?: string
}

export default function SecretSantaAssignment({
  giverName,
  receiverName,
  partyName,
}: SecretSantaAssignmentProps) {
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
                    {partyName && (
                      <p
                        style={{
                          margin: '0 0 8px',
                          fontSize: '24px',
                          fontFamily: "'Instrument Serif', Georgia, serif",
                          color: '#331a0d',
                          fontWeight: 'normal',
                          letterSpacing: '-0.5px',
                        }}
                      >
                        {partyName}:
                      </p>
                    )}
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
                      Your Secret Santa Assignment
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
                      Hi {giverName}!
                    </p>
                  </td>
                </tr>

                {/* Main content */}
                <tr>
                  <td align="center" style={{ padding: '0 40px 40px' }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '18px',
                        color: '#806656',
                        lineHeight: '1.7',
                        maxWidth: '520px',
                      }}
                    >
                      The Secret Santa assignments have been revealed! You've been matched with...
                    </p>
                  </td>
                </tr>

                {/* Receiver reveal box */}
                <tr>
                  <td align="center" style={{ padding: '0 40px 40px' }}>
                    <div
                      style={{
                        backgroundColor: '#fff9f0',
                        border: '3px solid #8c3e2b',
                        borderRadius: '12px',
                        padding: '40px 30px',
                        boxShadow: '0 4px 12px rgba(140, 62, 43, 0.15)',
                        maxWidth: '480px',
                        margin: '0 auto',
                      }}
                    >
                      <p
                        style={{
                          margin: '0 0 16px',
                          fontSize: '14px',
                          color: '#806656',
                          textTransform: 'uppercase',
                          letterSpacing: '2px',
                          fontWeight: '600',
                        }}
                      >
                        You're giving a gift to
                      </p>
                      <div
                        style={{
                          borderTop: '2px solid #e5ddd0',
                          paddingTop: '20px',
                          marginTop: '20px',
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: '42px',
                            fontFamily: "'Instrument Serif', Georgia, serif",
                            color: '#8c3e2b',
                            fontWeight: 'normal',
                            letterSpacing: '-0.5px',
                            lineHeight: '1.2',
                          }}
                        >
                          {receiverName}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Reminder */}
                <tr>
                  <td align="center" style={{ padding: '0 40px 40px' }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '16px',
                        color: '#806656',
                        lineHeight: '1.7',
                        maxWidth: '520px',
                        fontStyle: 'italic',
                      }}
                    >
                      Remember, this is a secret! Don't let them know you're their Secret Santa until the big reveal!
                    </p>
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
                      Happy gift giving! 🎄✨
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

