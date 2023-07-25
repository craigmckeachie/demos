function Greeter() {
  return <div className="container">Hello Function Component</div>;
}

function App() {
  return (
    <>
      <Greeter />
      <Greeter />
      <Greeter />
      <Greeter />
      <Greeter />
      <Greeter />
      <Greeter />
      <Greeter />
      <Greeter />
      <Greeter />
      <Greeter />
      <Greeter />
    </>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.createRoot(rootElement).render(<App />);
