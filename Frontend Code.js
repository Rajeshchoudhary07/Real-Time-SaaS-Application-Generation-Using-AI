import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [generatedComponent, setGeneratedComponent] = useState(null);
  const [pinnedComponents, setPinnedComponents] = useState([]);

  const handleGenerate = async () => {
    const res = await axios.post("http://localhost:8000/generate_ui/", { prompt });
    setGeneratedComponent(res.data.component);
  };

  const handlePin = async () => {
    await axios.post("http://localhost:8000/pin_component/", { prompt: generatedComponent });
    fetchPinnedComponents();
  };

  const fetchPinnedComponents = async () => {
    const res = await axios.get("http://localhost:8000/get_pinned_components/");
    setPinnedComponents(res.data.components);
  };

  useEffect(() => {
    fetchPinnedComponents();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">AI-Generated SaaS Components</h1>
      <input
        type="text"
        placeholder="Describe UI component..."
        className="border p-2 w-full mt-4"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={handleGenerate} className="bg-blue-500 text-white px-4 py-2 mt-2">Generate</button>

      {generatedComponent && (
        <div className="mt-4 p-4 border">
          <h2 className="text-xl font-semibold">Generated Component</h2>
          <div dangerouslySetInnerHTML={{ __html: generatedComponent }} />
          <button onClick={handlePin} className="bg-green-500 text-white px-4 py-2 mt-2">Pin</button>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Pinned Components</h2>
        {pinnedComponents.map((component, index) => (
          <div key={index} className="border p-4 mt-2">
            <div dangerouslySetInnerHTML={{ __html: component.content }} />
          </div>
        ))}
      </div>
    </div>
  );
}
