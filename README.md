#  DevGit — Client-Side Version Control System & DAG Commit Graph Engine (React)
-----------------------------------------------------------------------------------------

DevGit is an interactive Version Control System (VCS) and Content-Addressable Directed Acyclic Graph (DAG) commit engine built with React. It implements Git mechanics on the client side: managing Working Directory states, Staging Area indexing (`git add`), immutable commit object generation with SHA hashes (`git commit`), branch reference pointers (`git branch`, `git checkout`), and multi-parent merge resolvers (`git merge`).

##  Technical Architecture Overview
-------------------------------------------------------------------------------------

*  **DAG Commit Graph Engine:** Structures commit objects into a Directed Acyclic Graph (DAG), referencing parent SHA hashes to visualize historical branches.
*  **Branch & HEAD Pointer Management:** Manages dynamic reference pointers mapping branch names (`main`, `feature`) directly to commit hashes.
*  **Staging Index & Merge Resolver:** Simulates Git's two-stage commit lifecycle and dual-parent merge algorithm.




