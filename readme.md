# What is of high-ish priority?
- Low level chunks that are required for display
- Chunks that are lower res but still required for display


# What is of low priority? (but should still be in queue)
- Neighbour chunks of the current visibility config

# What should NOT be in the priority queue?
- Chunks that were never needed and that are not in the neighbouring
- Chunks once needed but the visibility config changed since (and not even in the neighbouring anymore)
- Chunks that were not used in a long time when memory cleaning

# What should make a priority higher?
-

# What should make a priority lower?
- A chunk was needed but is no longer needed. Still it is on the close neighbourhood


- **queue** files to be downloaded
- **prioritise** files that are more important
- **regulate** the number of concurrent downloads
- **download** to get a file buffer in memory
- **interrupt** a download if the file is no longer necessary
- **keep** buffers in memory to make them accessible
- **identify** each buffer for easy access
- **bind** events to buffer life-cycle (queued, started, progress, canceled, finished, removed)
- **monitor** the size of the whole buffer collection
- **clean** the buffers that were never used
