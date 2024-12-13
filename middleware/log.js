const logActivity = async (req, res, next) => {
    try {
      await Log.create({
        userId: req.user._id,
        action: req.method + ' ' + req.path,
        details: req.body,
      });
    } catch (error) {
      console.error('Logging error:', error);
    }
    next();
  };
  
  app.use(logActivity); // Apply globally or to specific routes
  
  const monitorSuspiciousActivity = async (req, res, next) => {
    if (req.body.action === 'suspicious') {
      // Trigger real-time alert
      io.emit('admin-alert', { message: 'Suspicious activity detected!' });
    }
    next();
  };
  
  app.post('/actions', monitorSuspiciousActivity);
  

  const schedule = require('node-schedule');

schedule.scheduleJob('0 0 * * *', async () => {
  console.log('Running compliance checks...');
  // Implement checks (e.g., user consent, payment logs)
});
 
//Fraud Detection
app.post('/admin/fraud-detection', (req, res) => {
    const { userId, transactions } = req.body;
    const isFraud = transactions.some(t => t.amount > 10000); // Example rule
    if (isFraud) {
      res.json({ alert: 'Potential fraud detected' });
    } else {
      res.json({ status: 'All clear' });
    }
  });