import { ScanResult } from '@/types/wcag';

interface ResultsDisplayProps {
  results: ScanResult[];
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Scan Results</h2>
      {results.map((result, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2">{result.filename}</h3>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-red-100 p-3 rounded">
              <p className="text-red-800 font-bold">{result.violationsCount}</p>
              <p className="text-red-600">Violations</p>
            </div>
            <div className="bg-green-100 p-3 rounded">
              <p className="text-green-800 font-bold">{result.passes}</p>
              <p className="text-green-600">Passes</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded">
              <p className="text-yellow-800 font-bold">{result.incomplete}</p>
              <p className="text-yellow-600">Needs Review</p>
            </div>
            <div className="bg-gray-100 p-3 rounded">
              <p className="text-gray-800 font-bold">{result.inapplicable}</p>
              <p className="text-gray-600">Not Applicable</p>
            </div>
          </div>
          <details>
            <summary className="cursor-pointer text-blue-600">View Details</summary>
            <div className="mt-4 space-y-4">
              {result.violations.map((violation, idx) => (
                <div key={idx} className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-bold">{violation.rule}</h4>
                  <p className="text-sm text-gray-600">Impact: {violation.impact}</p>
                  <p>{violation.description}</p>
                  <a href={violation.helpUrl} className="text-blue-600 text-sm" target="_blank" rel="noopener noreferrer">
                    Learn more
                  </a>
                </div>
              ))}
            </div>
          </details>
        </div>
      ))}
    </div>
  );
}