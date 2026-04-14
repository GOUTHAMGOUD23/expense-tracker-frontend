import { BrowserRouter, Routes, Route } from "react-router-dom";

function Test() {
  return <h1 style={{ color: "black" }}>ROUTE WORKING ✅</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/oauth2/redirect" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;