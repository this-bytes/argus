import Terminal from '../components/Terminal';
import Viewport from '../components/Viewport';

function Home() {
  return (
    <div className="split-pane">
      {/* Terminal pane (left) */}
      <div className="split-pane-left">
        <Terminal />
      </div>

      {/* Viewport pane (right) */}
      <div className="split-pane-right">
        <Viewport />
      </div>
    </div>
  );
}

export default Home;
