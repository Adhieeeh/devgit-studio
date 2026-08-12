import React, { useState } from 'react';


const generateCommitHash = (message, parentHash, timestamp) => {
  const str = `${message}-${parentHash}-${timestamp}-${Math.random()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(7, '0').slice(0, 7);
};


const GENESIS_HASH = 'c0a18f2';
const INITIAL_COMMITS = {
  [GENESIS_HASH]: {
    hash: GENESIS_HASH,
    message: 'Initial commit: Genesis root',
    parents: [],
    branch: 'main',
    timestamp: '00:00:00',
    files: { 'index.js': '// Entry point\nconsole.log("Hello World");' }
  }
};

function App() {
  
  const [commits, setCommits] = useState(INITIAL_COMMITS);
  const [branches, setBranches] = useState({ main: GENESIS_HASH });
  const [activeBranch, setActiveBranch] = useState('main');
  
  
  const [workingFile, setWorkingFile] = useState('// Entry point\nconsole.log("Hello World");');
  const [stagedFile, setStagedFile] = useState(null);
  
  
  const [commitMessage, setCommitMessage] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [mergeTargetBranch, setMergeTargetBranch] = useState('');
  
 
  const [vcsLogs, setVcsLogs] = useState([
    ` DevGit VCS Kernel initialized. HEAD pointing to [${activeBranch}] at ${GENESIS_HASH}`
  ]);


  const headCommitHash = branches[activeBranch];
  const headCommit = commits[headCommitHash];

  
  const handleStageChanges = () => {
    if (workingFile === headCommit.files['index.js']) {
      setVcsLogs(prev => [' Nothing to stage. Working directory clean.', ...prev]);
      return;
    }
    setStagedFile(workingFile);
    setVcsLogs(prev => [' STAGED: Changes indexed to Staging Area. Ready for commit.', ...prev]);
  };

  
  const handleCommit = (e) => {
    e.preventDefault();
    if (!stagedFile) {
      setVcsLogs(prev => ['❌ COMMIT FAILED: Staging area empty. Run "git add" first.', ...prev]);
      return;
    }
    if (!commitMessage.trim()) return;

    const newHash = generateCommitHash(commitMessage, headCommitHash, Date.now());
    const timestamp = new Date().toLocaleTimeString();

    const newCommitObject = {
      hash: newHash,
      message: commitMessage.trim(),
      parents: [headCommitHash],
      branch: activeBranch,
      timestamp,
      files: { 'index.js': stagedFile }
    };

    setCommits(prev => ({ ...prev, [newHash]: newCommitObject }));
    setBranches(prev => ({ ...prev, [activeBranch]: newHash }));
    setStagedFile(null);
    setCommitMessage('');
    setVcsLogs(prev => [
      `✅ COMMITTED [${newHash}]: "${newCommitObject.message}" on branch [${activeBranch}]`,
      ...prev
    ]);
  };

 
  const handleCreateBranch = (e) => {
    e.preventDefault();
    const cleanName = newBranchName.trim().toLowerCase().replace(/\s+/g, '-');
    if (!cleanName || branches[cleanName]) return;

    setBranches(prev => ({ ...prev, [cleanName]: headCommitHash }));
    setVcsLogs(prev => [`🌿 BRANCH CREATED: [${cleanName}] pointing to commit ${headCommitHash}`, ...prev]);
    setNewBranchName('');
  };

  
  const handleCheckout = (targetBranch) => {
    if (targetBranch === activeBranch) return;
    
    const targetHash = branches[targetBranch];
    const targetCommit = commits[targetHash];

    setActiveBranch(targetBranch);
    setWorkingFile(targetCommit.files['index.js']);
    setStagedFile(null);
    setVcsLogs(prev => [
      `CHECKOUT: Switched to branch [${targetBranch}]. HEAD at ${targetHash}`,
      ...prev
    ]);
  };

 
  const handleMerge = (e) => {
    e.preventDefault();
    if (!mergeTargetBranch || mergeTargetBranch === activeBranch) return;

    const sourceHash = branches[mergeTargetBranch];
    const targetHash = branches[activeBranch];

    if (sourceHash === targetHash) {
      setVcsLogs(prev => ['ℹ️ MERGE SKIPPED: Already up to date.', ...prev]);
      return;
    }

    const timestamp = new Date().toLocaleTimeString();
    const mergeHash = generateCommitHash(`Merge branch '${mergeTargetBranch}' into ${activeBranch}`, targetHash, Date.now());
    const mergedContent = `${commits[targetHash].files['index.js']}\n\n// --- Merged from ${mergeTargetBranch} ---\n${commits[sourceHash].files['index.js']}`;

    const mergeCommit = {
      hash: mergeHash,
      message: `Merge branch '${mergeTargetBranch}' into ${activeBranch}`,
      parents: [targetHash, sourceHash], 
      branch: activeBranch,
      timestamp,
      files: { 'index.js': mergedContent }
    };

    setCommits(prev => ({ ...prev, [mergeHash]: mergeCommit }));
    setBranches(prev => ({ ...prev, [activeBranch]: mergeHash }));
    setWorkingFile(mergedContent);
    setVcsLogs(prev => [
      `🎉 MERGED: Integrated [${mergeTargetBranch}] into [${activeBranch}]. Merge commit created (${mergeHash}).`,
      ...prev
    ]);
    setMergeTargetBranch('');
  };

  
  const commitList = Object.values(commits);

  return (
    <div style={{ maxWidth: '1350px', margin: '30px auto', padding: '0 24px', fontFamily: 'monospace', backgroundColor: '#070a13', color: '#f8fafc', minHeight: '92vh' }}>
      
      {/* HEADER CONTROLS STRIP */}
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '20px', marginBottom: '30px', gap: '20px' }}>
        <div>
          <h1 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', letterSpacing: '-0.5px' }}> DevGit Version Control Engine</h1>
          <p style={{ margin: '4px 0 0 0', color: '#475569', fontSize: '12px' }}>
            Interactive DAG commit history graph, branch pointers, staging index & merge resolver.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #f59e0b', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', color: '#f59e0b' }}>
            <span>HEAD ➔ </span>
            <strong>[{activeBranch}] @ {headCommitHash}</strong>
          </div>
        </div>
      </header>

     
      <section style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '16px', marginBottom: '30px', overflowX: 'auto' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Commit DAG History Tree</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px', paddingBottom: '10px', minWidth: '700px' }}>
          {commitList.map((commit, idx) => {
            const isHead = commit.hash === headCommitHash;
            const branchPointers = Object.entries(branches).filter(([_, hash]) => hash === commit.hash).map(([b]) => b);

            return (
              <React.Fragment key={commit.hash}>
                <div style={{ 
                  minWidth: '200px', backgroundColor: '#070a13', border: `1px solid ${isHead ? '#f59e0b' : '#1e293b'}`, 
                  padding: '14px', borderRadius: '10px', position: 'relative',
                  boxShadow: isHead ? '0 0 12px rgba(245, 158, 11, 0.2)' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginBottom: '6px' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{commit.hash}</span>
                    <span>{commit.timestamp}</span>
                  </div>

                  <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {commit.message}
                  </h4>

                  <div style={{ fontSize: '10px', color: '#475569' }}>
                    Parents: {commit.parents.length > 0 ? commit.parents.join(', ') : 'ROOT'}
                  </div>

                  {/* Branch Pointers Indicators */}
                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {branchPointers.map(b => (
                      <span key={b} style={{ fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', backgroundColor: b === activeBranch ? '#f59e0b' : '#1e293b', color: b === activeBranch ? '#070a13' : '#94a3b8' }}>
                        {b} {b === activeBranch ? '(HEAD)' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                
                {idx < commitList.length - 1 && (
                  <div style={{ color: '#334155', fontSize: '16px' }}>➔</div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px 320px', gap: '25px', marginBottom: '30px' }}>
        
        
        <section style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Working Directory (`index.js`)</h3>
            <button onClick={handleStageChanges} style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
              git add index.js 
            </button>
          </div>

          <textarea 
            value={workingFile}
            onChange={(e) => setWorkingFile(e.target.value)}
            style={{ width: '100%', height: '160px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '12px', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
          />

          <form onSubmit={handleCommit} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Commit message (e.g. feat: add auth gate)" 
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
            />
            <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#10b981', color: '#070a13', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              git commit 
            </button>
          </form>
        </section>

        
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* BRANCH MANAGEMENT */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Branch Operations</h3>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '15px' }}>
              {Object.keys(branches).map(b => (
                <button 
                  key={b} 
                  onClick={() => handleCheckout(b)}
                  style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '11px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: b === activeBranch ? '#f59e0b' : '#070a13', color: b === activeBranch ? '#070a13' : '#cbd5e1' }}
                >
                  {b === activeBranch ? '✓ ' : ''}{b}
                </button>
              ))}
            </div>

            <form onSubmit={handleCreateBranch} style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="New branch name..." value={newBranchName} onChange={(e) => setNewBranchName(e.target.value)} style={{ flex: 1, padding: '8px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }} />
              <button type="submit" style={{ padding: '8px 12px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>git branch 🌿</button>
            </form>
          </div>

          
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Merge Engine</h3>
            <form onSubmit={handleMerge} style={{ display: 'flex', gap: '8px' }}>
              <select value={mergeTargetBranch} onChange={(e) => setMergeTargetBranch(e.target.value)} style={{ flex: 1, padding: '8px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px' }}>
                <option value="">Select branch to merge...</option>
                {Object.keys(branches).filter(b => b !== activeBranch).map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <button type="submit" disabled={!mergeTargetBranch} style={{ padding: '8px 12px', backgroundColor: '#a78bfa', color: '#070a13', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: !mergeTargetBranch ? 'not-allowed' : 'pointer' }}>git merge 🔀</button>
            </form>
          </div>

        </section>

        
        <aside style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Staging Area Index</h3>
          {stagedFile ? (
            <div style={{ backgroundColor: '#070a13', border: '1px solid #10b981', borderRadius: '8px', padding: '12px', fontSize: '11px', color: '#10b981', height: '180px', overflow: 'auto' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>✓ STAGED FOR COMMIT: index.js</div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{stagedFile}</pre>
            </div>
          ) : (
            <div style={{ color: '#475569', fontSize: '11px', textAlign: 'center', marginTop: '60px' }}>
              Staging area empty. Run "git add" to stage working directory modifications.
            </div>
          )}
        </aside>

      </div>

      
      <footer style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>VCS Terminal Execution Logs</h3>
        <div style={{ backgroundColor: '#070a13', borderRadius: '8px', padding: '12px', height: '110px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {vcsLogs.map((log, idx) => (
            <div key={idx} style={{ fontSize: '11px', color: log.includes('❌') ? '#ef4444' : log.includes('✅') || log.includes('🎉') ? '#10b981' : log.includes('🔀') ? '#a78bfa' : '#64748b' }}>
              {log}
            </div>
          ))}
        </div>
      </footer>

    </div>
  );
}

export default App;