// Main entry point that exports the component and initializes it
import React from 'react';
import ReactDOM from 'react-dom';
import Minesweeper from './components/Minesweeper';
import './styles/minesweeper.css';

// Export the component for external use
export default Minesweeper;

// Auto-initialize when DOM is ready (for Jekyll pages)
document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('minesweeper-app');
  if (container && typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
    ReactDOM.render(React.createElement(Minesweeper), container);
  }
});

// Also expose on window for manual initialization
if (typeof window !== 'undefined') {
  (window as any).Minesweeper = Minesweeper;
}
