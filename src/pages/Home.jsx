import Terminal from '../components/TerminalV2';
import Viewport from '../components/ViewportV2';

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
