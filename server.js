const express = require("express");
const cors = require("cors");
const {VM} = require("vm2");
const app = express();


const corsOptions = {
  origin: ['https://runnodejs.vercel.app', 'http://localhost:3000'], // Add your frontend URL here
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(express.json());

app.post('/nodejs', (req, res) => {
  const { code } = req.body;
  const logs = [];
  const startTime = performance.now();

  try {
    const vm = new VM({
      timeout: 5000, // 5 second timeout
      sandbox: {
        console: {
          log: (...args) => {
            const formattedArgs = args.map(arg => {
              if (Array.isArray(arg)) {
                return `[${arg.join(', ')}]`;
              }
              return typeof arg === 'object' ? 
                JSON.stringify(arg) : 
                String(arg);
            }).join(' ');
            
            // Only push the formatted string without extra newline
            logs.push(formattedArgs);
          },
          error: (...args) => {
            logs.push('Error: ' + args.join(' '));
          },
          warn: (...args) => {
            logs.push('Warning: ' + args.join(' '));
          }
        }
      }
    });

    vm.run(code);
    
    const executionTime = Math.round(performance.now() - startTime);
    res.json({
      // Join logs with single newline
      result: logs.join('\n'),
      error: null,
      executionTime
    });
  } catch (error) {
    const executionTime = Math.round(performance.now() - startTime);
    res.json({
      result: logs.join('\n'),
      error: error.message,
      executionTime
    });
  }
});

app.get("/",(req,res)=>{
  res.send(`Backend Working on port ${PORT}`);
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});