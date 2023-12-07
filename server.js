const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const rooms = [];
const bookings = [];

// 1. Create a room
app.post('/createRoom', (req, res) => {
  const { roomName, seats, amenities, pricePerHour } = req.body;
  const room = {
    id: rooms.length + 1,
    name: roomName,
    seats,
    amenities,
    pricePerHour,
  };
  rooms.push(room);
  res.json(room);
});

// 2. Book a room
app.post('/bookRoom', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;

  // Checking if the room is available
  const conflictingBooking = bookings.find(
    (booking) =>
      booking.roomId === roomId &&
      booking.date === date &&
      ((startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime) ||
        (startTime <= booking.startTime && endTime >= booking.endTime))
  );

  if (conflictingBooking) {
    return res.status(400).json({ error: 'Room already booked for the specified time' });
  }

  const booking = {
    id: bookings.length + 1,
    customerName,
    date,
    startTime,
    endTime,
    roomId,
  };
  bookings.push(booking);
  res.json(booking);
});

// 3. List all rooms with booked data
app.get('/listRooms', (req, res) => {
  const roomList = rooms.map((room) => {
    const booking = bookings.find((booking) => booking.roomId === room.id);
    return {
      roomName: room.name,
      bookedStatus: booking ? 'Booked' : 'Available',
      customerName: booking ? booking.customerName : '',
      date: booking ? booking.date : '',
      startTime: booking ? booking.startTime : '',
      endTime: booking ? booking.endTime : '',
    };
  });
  res.json(roomList);
});

// 4. List all customers with booked data
app.get('/listCustomers', (req, res) => {
  const customerList = bookings.map((booking) => {
    const room = rooms.find((room) => room.id === booking.roomId);
    return {
      customerName: booking.customerName,
      roomName: room ? room.name : '',
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    };
  });
  res.json(customerList);
});

// 5. List how many times a customer has booked the room
app.get('/customerBookings/:customerName', (req, res) => {
  const customerName = req.params.customerName;
  const customerBookings = bookings
    .filter((booking) => booking.customerName === customerName)
    .map((booking) => ({
      customerName: booking.customerName,
      roomName: rooms.find((room) => room.id === booking.roomId)?.name || '',
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookingId: booking.id,
      bookingDate: new Date().toISOString(),
      bookingStatus: 'Confirmed', 
    }));
  res.json(customerBookings);
});

app.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});
