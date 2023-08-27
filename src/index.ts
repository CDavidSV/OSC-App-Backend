import server from './server';

// Server port
const port = 3000;

// Main server function
const main = () => {
    server.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`.green);
    });
};

main();