import { Fragment } from 'react'

// Renders admin-entered text with line breaks preserved (each \n → <br />).
export default function MultiLine({ text }) {
  const lines = String(text || '').split('\n')
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ))
}
