/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import Workspace from "./pages/Workspace";
import Chat from "./pages/Chat";
import Transcribe from "./pages/Transcribe";
import TTS from "./pages/TTS";
import FastAnalysis from "./pages/FastAnalysis";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="workspace" element={<Workspace />} />
          <Route path="chat" element={<Chat />} />
          <Route path="transcribe" element={<Transcribe />} />
          <Route path="tts" element={<TTS />} />
          <Route path="fast" element={<FastAnalysis />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
