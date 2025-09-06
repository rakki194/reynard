import { JSX } from 'solid-js'
import './Loader.css'

interface LoaderProps {
  children: JSX.Element
}

export const Loader = (props: LoaderProps) => {
  return (
    <div class="monaco-loader">
      {props.children}
    </div>
  )
}
