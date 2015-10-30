### Server with Filesystem Persistance and Tests

#### Installation

    git clone {repo name} target_folder
    cd target_folder
    npm install
    npm install -g mocha
    npm test
    
#### Usage

The server is hard-coded to use port 4000.  Start the server as follows:

    npm start
    
Stop the server by entering `ctrl-c` in the terminal window where it's running.


Access the server at the following urls:

    http://localhost:4000/set?{key}={value}
    http://localhost:4000/get?key={key}
    
The persisted key-value pairs are saved to a file in the project directory, `cache.json`