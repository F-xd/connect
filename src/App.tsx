import { useEffect, useRef } from 'react'
import './App.scss'
import Connect from './components/Connect'
export default function App() {
  const appRef = useRef<HTMLDivElement>(null)
  const setWindosSize = ()=>{
    const {innerWidth,innerHeight} = window
    const appDom = appRef.current as HTMLDivElement;
    const value = (innerWidth>(innerHeight-200)? innerHeight : innerWidth+200);
    appDom.style.width = value-200+'px';
    appDom.style.height = value+'px';
  } 
  useEffect(setWindosSize,[]);
  window.addEventListener('resize',setWindosSize);
  return (
    <div className='app' ref={appRef}>
      <Connect />
    </div>
  )
}
