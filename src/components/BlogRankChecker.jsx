import React, { useState } from "react";
import axios from "axios";
import { CSVLink } from "react-csv"; // Import CSVLink from react-csv

const BulkKeywordLinkChecker = () => {
  const [inputText, setInputText] = useState(
    "apple inc,https://example.com/apple\n" +
    "google search,https://example.com/google\n" +
    "openai,https://example.com/openai"
  );
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const API_KEY = import.meta.env.REACT_APP_API_KEY;

  const handleBulkCheck = async () => {
    setLoading(true);
    setResults([]);
    setProgress(0);

    const lines = inputText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const dataPairs = lines
      .map((line) => {
        const [keyword, url] = line.split(",");
        return { keyword: keyword?.trim(), url: url?.trim() };
      })
      .filter((pair) => pair.keyword && pair.url);

    const totalCount = dataPairs.length;
    const allResults = [];

    for (let i = 0; i < totalCount; i++) {
      const { keyword, url } = dataPairs[i];
      try {
        const response = await axios.post(
          "https://google.serper.dev/search",
          { q: keyword },
          {
            headers: {
              "X-API-KEY": API_KEY,
              "Content-Type": "application/json",
            },
          }
        );

        const data = response.data;

        const organicMatch = data.organic?.find((item) => item.link === url);

        allResults.push({
          keyword,
          url,
          organic: organicMatch ? `#${organicMatch.position}` : "Not Found",
        });
      } catch (error) {
        console.error(`Error for "${keyword}":`, error);
        allResults.push({
          keyword,
          url,
          organic: "Error",
        });
      }

      // Update progress after each iteration
      const currentProgress = Math.floor(((i + 1) / totalCount) * 100);
      setProgress(currentProgress);
    }

    setResults(allResults);
    setLoading(false);
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center text-primary">📦 Bulk Blog Rank Checker</h2>

      <div className="mb-4">
        <label htmlFor="bulkInput" className="form-label fw-bold">
          Enter Keyword & Blog Link (comma-separated, one per line):
        </label>
        <textarea
          id="bulkInput"
          className="form-control"
          rows="8"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. apple inc,https://example.com/apple"
        />
      </div>

      <div className="d-grid mb-4">
        <button
          className="btn btn-primary btn-lg"
          onClick={handleBulkCheck}
          disabled={loading}
        >
          {loading ? "Checking..." : "Check All Rankings"}
        </button>
      </div>

      {loading && (
        <div className="mb-4">
          <div className="progress">
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              role="progressbar"
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Progress: blog rank checking"
            >
              {progress}% Done
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <>
          <div className="table-responsive mb-4">
            <h4 className="mb-3">📊 Results</h4>
            <table className="table table-bordered table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Keyword</th>
                  <th scope="col">Blog URL</th>
                  <th scope="col">Organic Rank</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{res.keyword}</td>
                    <td>
                      <a href={res.url} target="_blank" rel="noopener noreferrer">
                        {res.url}
                      </a>
                    </td>
                    <td>{res.organic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-grid mb-4">
            <CSVLink
              data={results}
              headers={[
                { label: "Keyword", key: "keyword" },
                { label: "Blog URL", key: "url" },
                { label: "Organic Rank", key: "organic" },
              ]}
              filename="keyword_rankings.csv"
              className="btn btn-success btn-lg"
            >
              Download CSV
            </CSVLink>
          </div>
        </>
      )}

      {!loading && results.length === 0 && (
        <p className="text-muted text-center mt-4">
          Submit your keywords and links above to get started.
        </p>
      )}
    </div>
  );
};

export default BulkKeywordLinkChecker;
