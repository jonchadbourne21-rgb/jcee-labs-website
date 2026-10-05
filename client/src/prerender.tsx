import React from "react";
import { renderToPipeableStream } from "react-dom/server";
import { PassThrough } from "node:stream";
import { Router } from "wouter";
import App from "./App";

export function render(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let result = "";
    const output = new PassThrough();
    output.on("data", chunk => {
      result += chunk.toString();
    });
    output.on("end", () => resolve(result));
    const stream = renderToPipeableStream(
      <Router ssrPath={url}>
        <App />
      </Router>,
      {
        onAllReady() {
          stream.pipe(output);
        },
        onError(error) {
          reject(error);
        },
      }
    );
  });
}
