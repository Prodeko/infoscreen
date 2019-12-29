const Error = (): void => {}

Error.getInitialProps = ({ ctx }) => {
  const { req, res } = ctx
  if (req) {
    res.writeHead(302, { Location: `/` })
    res.end()
  }
}

export default Error
