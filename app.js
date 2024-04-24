const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

app.use(bodyParser.json())
// Function to calculate total price
function calculateTotalPrice(bodyParams) {
    // Base distance and price
    const baseDistance = 5;
    const basePrice = 10;

    // Per km price for perishable and non-perishable items
    const perishableKmPrice = 1.5;
    const nonPerishableKmPrice = 1;

    // Extract request body parameters
    const { zone, organization_id, total_distance, item_type } = bodyParams;

    let totalPrice = basePrice;
    if (total_distance > baseDistance) {
        const additionalDistance = total_distance - baseDistance;
        const additionalPrice = item_type === 'perishable' ? perishableKmPrice : nonPerishableKmPrice;
        totalPrice += additionalDistance * additionalPrice;
    }

    return totalPrice;
}

// PostgreSQL connection configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'food_delivery',
  password: '00570',
  port: 5432,
});

// Endpoint to get pricing based on zone, organization_id, and total_distance
app.post('/pricing', async (req, res) => {
  const { zone, organization_id, total_distance, item_type } = req.body;

  if (!zone || !organization_id || !total_distance || !item_type) {
    return res.status(400).json({ error: 'Missing required parameters' });
}

const totalPrice = calculateTotalPrice(req.body);

try {
    // Insert data into the database
    const insertQuery = `
      INSERT INTO pricings (zone, organization_id, total_price,base_distance_in_km,km_price,fix_price)
      VALUES ($1, $2, $3,$4,$5,$6)
    `;
    const values = [zone, organization_id, totalPrice,5,1.5,10];
    await pool.query(insertQuery, values);

    res.json({ total_price: totalPrice });
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({ error: 'An error occurred while saving the data' });
  }
});
    
 


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
