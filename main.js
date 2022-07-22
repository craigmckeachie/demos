function HelloWorld() {
  return <div className="container">Hello World</div>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<HelloWorld />);
