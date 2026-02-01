import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Network, 
  Zap,
  Download,
  Loader2,
  X
} from 'lucide-react';

const McpAnalysisPanel = ({ analysisData }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!analysisData) {
    return (
      <div className="bg-[#1b0f2f] border border-purple-500/20 rounded-none p-6 text-center">
        <Activity className="w-12 h-12 mx-auto mb-4 text-purple-400" />
        <p className="text-purple-300">No analysis data available</p>
      </div>
    );
  }

  const hasValidation = analysisData.validation && !analysisData.validation.error;
  const hasBom = analysisData.bom && !analysisData.bom.error;
  const hasNetlist = analysisData.netlist && !analysisData.netlist.error;
  const hasPatterns = analysisData.patterns && !analysisData.patterns.error;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity, show: true },
    { id: 'validation', label: 'Validation', icon: CheckCircle, show: hasValidation },
    { id: 'bom', label: 'BOM', icon: FileText, show: hasBom },
    { id: 'netlist', label: 'Netlist', icon: Network, show: hasNetlist },
    { id: 'patterns', label: 'Patterns', icon: Zap, show: hasPatterns },
  ].filter(tab => tab.show);

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="bg-[#140a24] border border-purple-500/20 rounded-none p-4">
        <h3 className="text-lg font-semibold text-purple-100 mb-2">Analysis Summary</h3>
        <p className="text-sm text-purple-300 mb-4">
          Project analyzed on {new Date(analysisData.timestamp).toLocaleString()}
        </p>
        
        <div className="grid gap-3 md:grid-cols-2">
          <div className={`flex items-start space-x-3 p-3 border rounded-none ${
            hasValidation ? 'border-green-500/30 bg-green-900/10' : 'border-red-500/30 bg-red-900/10'
          }`}>
            {hasValidation ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
            <div>
              <p className="font-semibold text-purple-100">Validation</p>
              <p className="text-xs text-purple-300">
                {hasValidation ? 'Passed' : 'Not available'}
              </p>
            </div>
          </div>

          <div className={`flex items-start space-x-3 p-3 border rounded-none ${
            hasBom ? 'border-green-500/30 bg-green-900/10' : 'border-red-500/30 bg-red-900/10'
          }`}>
            {hasBom ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
            <div>
              <p className="font-semibold text-purple-100">BOM</p>
              <p className="text-xs text-purple-300">
                {hasBom ? 'Generated' : 'Not available'}
              </p>
            </div>
          </div>

          <div className={`flex items-start space-x-3 p-3 border rounded-none ${
            hasNetlist ? 'border-green-500/30 bg-green-900/10' : 'border-red-500/30 bg-red-900/10'
          }`}>
            {hasNetlist ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
            <div>
              <p className="font-semibold text-purple-100">Netlist</p>
              <p className="text-xs text-purple-300">
                {hasNetlist ? 'Extracted' : 'Not available'}
              </p>
            </div>
          </div>

          <div className={`flex items-start space-x-3 p-3 border rounded-none ${
            hasPatterns ? 'border-green-500/30 bg-green-900/10' : 'border-red-500/30 bg-red-900/10'
          }`}>
            {hasPatterns ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
            <div>
              <p className="font-semibold text-purple-100">Patterns</p>
              <p className="text-xs text-purple-300">
                {hasPatterns ? 'Identified' : 'Not available'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderValidation = () => {
    if (!hasValidation) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-none p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-200">Validation unavailable</p>
            <p className="text-sm text-red-300">
              {analysisData.validation?.error || 'Validation data not available'}
            </p>
          </div>
        </div>
      );
    }

    const validation = analysisData.validation;
    return (
      <div className="space-y-3">
        <div className="bg-[#140a24] border border-purple-500/20 rounded-none p-4">
          <h3 className="text-lg font-semibold text-purple-100 mb-3">Project Validation</h3>
          
          {validation.status && (
            <div className={`inline-block px-3 py-1 rounded-none text-sm font-medium ${
              validation.status === 'valid' ? 'bg-green-900/40 text-green-200' : 'bg-yellow-900/40 text-yellow-200'
            }`}>
              {validation.status.toUpperCase()}
            </div>
          )}

          {validation.warnings && validation.warnings.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-yellow-200 mb-2">Warnings</h4>
              <ul className="space-y-2">
                {validation.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-yellow-300">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validation.errors && validation.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-red-200 mb-2">Errors</h4>
              <ul className="space-y-2">
                {validation.errors.map((error, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-red-300">
                    <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBom = () => {
    if (!hasBom) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-none p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-200">BOM unavailable</p>
            <p className="text-sm text-red-300">
              {analysisData.bom?.error || 'BOM data not available'}
            </p>
          </div>
        </div>
      );
    }

    const bom = analysisData.bom;
    return (
      <div className="space-y-3">
        <div className="bg-[#140a24] border border-purple-500/20 rounded-none p-4">
          <h3 className="text-lg font-semibold text-purple-100 mb-3">Bill of Materials</h3>
          
          {bom.component_count && (
            <p className="text-sm text-purple-300 mb-4">
              Total Components: <span className="font-semibold text-purple-100">{bom.component_count}</span>
            </p>
          )}

          {bom.components && bom.components.length > 0 && (
            <div className="space-y-2">
              {bom.components.slice(0, 10).map((component, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-[#1b0f2f] border border-purple-500/10 rounded-none">
                  <div>
                    <p className="text-sm font-medium text-purple-100">{component.reference}</p>
                    <p className="text-xs text-purple-400">{component.value}</p>
                  </div>
                  <p className="text-sm text-purple-300">{component.footprint}</p>
                </div>
              ))}
              {bom.components.length > 10 && (
                <p className="text-xs text-purple-400 mt-2">
                  And {bom.components.length - 10} more components...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderNetlist = () => {
    if (!hasNetlist) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-none p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-200">Netlist unavailable</p>
            <p className="text-sm text-red-300">
              {analysisData.netlist?.error || 'Netlist data not available'}
            </p>
          </div>
        </div>
      );
    }

    const netlist = analysisData.netlist;
    return (
      <div className="space-y-3">
        <div className="bg-[#140a24] border border-purple-500/20 rounded-none p-4">
          <h3 className="text-lg font-semibold text-purple-100 mb-3">Netlist</h3>
          
          {netlist.net_count && (
            <p className="text-sm text-purple-300 mb-4">
              Total Nets: <span className="font-semibold text-purple-100">{netlist.net_count}</span>
            </p>
          )}

          {netlist.nets && netlist.nets.length > 0 && (
            <div className="space-y-2">
              {netlist.nets.slice(0, 5).map((net, index) => (
                <div key={index} className="p-2 bg-[#1b0f2f] border border-purple-500/10 rounded-none">
                  <p className="text-sm font-medium text-purple-100">{net.name}</p>
                  <p className="text-xs text-purple-400 mt-1">
                    {net.components?.slice(0, 3).join(', ')}
                    {net.components?.length > 3 && '...'}
                  </p>
                </div>
              ))}
              {netlist.nets.length > 5 && (
                <p className="text-xs text-purple-400 mt-2">
                  And {netlist.nets.length - 5} more nets...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPatterns = () => {
    if (!hasPatterns) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-none p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-200">Patterns unavailable</p>
            <p className="text-sm text-red-300">
              {analysisData.patterns?.error || 'Pattern data not available'}
            </p>
          </div>
        </div>
      );
    }

    const patterns = analysisData.patterns;
    return (
      <div className="space-y-3">
        <div className="bg-[#140a24] border border-purple-500/20 rounded-none p-4">
          <h3 className="text-lg font-semibold text-purple-100 mb-3">Circuit Patterns</h3>
          
          {patterns.patterns && patterns.patterns.length > 0 ? (
            <div className="space-y-2">
              {patterns.patterns.map((pattern, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-[#1b0f2f] border border-purple-500/10 rounded-none">
                  <Zap className="w-5 h-5 text-purple-300 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-purple-100">{pattern.type}</p>
                    <p className="text-xs text-purple-400 mt-1">
                      {pattern.description || 'No description'}
                    </p>
                    {pattern.components && (
                      <p className="text-xs text-purple-400 mt-1">
                        Components: {pattern.components.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-purple-300">No circuit patterns identified</p>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'validation': return renderValidation();
      case 'bom': return renderBom();
      case 'netlist': return renderNetlist();
      case 'patterns': return renderPatterns();
      default: return renderOverview();
    }
  };

  return (
    <div className="bg-[#1b0f2f] border border-purple-500/20 rounded-none overflow-hidden">
      <div className="flex border-b border-purple-500/20 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-700 text-purple-100 border-b-2 border-purple-500'
                  : 'text-purple-300 hover:bg-purple-900/50 hover:text-purple-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default McpAnalysisPanel;
