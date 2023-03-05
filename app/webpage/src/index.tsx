import { GameCanvas } from './components/GameCanvas';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Header } from './components/Header';

export default function App() {
    return (
        <div className="App">
            <Header/>
            <GameCanvas/>
        </div>
    );
}

const domContainer = document.querySelector('#root');
const root = createRoot(domContainer!);
root.render(<App />)
