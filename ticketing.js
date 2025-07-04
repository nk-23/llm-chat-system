const fs = require('fs/promises');
const path = require('path');

const TICKETS_FILE = path.join(__dirname, 'tickets.json');

/**
 * Create a new support ticket
 * @param {string} issue - Description of the issue
 * @param {string} user - User identifier
 * @returns {Promise<string>} Ticket ID
 */
async function createTicket(issue, user, priority = 'medium') {
  const ticketId = `TICKET-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const ticket = {
    id: ticketId,
    issue,
    user,
    priority,
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  let tickets = [];
  try {
    const data = await fs.readFile(TICKETS_FILE, 'utf-8');
    tickets = JSON.parse(data);
  } catch (err) {
    // If file doesn't exist, start with empty array
    if (err.code !== 'ENOENT') throw err;
  }

  tickets.push(ticket);
  await fs.writeFile(TICKETS_FILE, JSON.stringify(tickets, null, 2));
  return ticketId;
}

/**
 * Get all tickets
 * @returns {Promise<Array>} Array of all tickets
 */
async function getAllTickets() {
  try {
    const data = await fs.readFile(TICKETS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist, return empty array
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

/**
 * Get a specific ticket by ID
 * @param {string} ticketId - Ticket ID to retrieve
 * @returns {Promise<Object|null>} Ticket object or null if not found
 */
async function getTicket(ticketId) {
  const tickets = await getAllTickets();
  return tickets.find(ticket => ticket.id === ticketId) || null;
}

/**
 * Update ticket status
 * @param {string} ticketId - Ticket ID to update
 * @param {string} status - New status (open, in-progress, resolved, closed)
 * @returns {Promise<boolean>} Success status
 */
async function updateTicketStatus(ticketId, status) {
  const tickets = await getAllTickets();
  const ticketIndex = tickets.findIndex(ticket => ticket.id === ticketId);
  
  if (ticketIndex === -1) {
    return false;
  }
  
  tickets[ticketIndex].status = status;
  tickets[ticketIndex].updatedAt = new Date().toISOString();
  
  await fs.writeFile(TICKETS_FILE, JSON.stringify(tickets, null, 2));
  return true;
}

module.exports = { 
  createTicket, 
  getAllTickets, 
  getTicket, 
  updateTicketStatus 
}; 