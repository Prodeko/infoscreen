import Router from 'next/router'

const Error = () => {}

Error.getInitialProps = ({ ctx }) => {
  const { req, res } = ctx
  if (req) {
    res.writeHead(302, { Location: `/` })
    res.end()
  } else {
    Router.push(`/`)
  }
}

export default Error
