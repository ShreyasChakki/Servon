# SERVON - Test User Credentials

> **⚠️ WARNING**: These are test credentials for development only. Never use in production!

## Quick Access

All passwords are for **development/testing only**.

---

## 👤 ADMIN ACCOUNT

```
Email:    admin@servon.com
Password: admin123
Role:     Administrator
Phone:    9999999999
Location: Mumbai
```

---

## 👥 CUSTOMER ACCOUNTS

### Customer 1 - John
```
Email:    customer@servon.com
Password: customer123
Name:     John Customer
Phone:    9876543210
Location: Bangalore
Wallet:   ₹500 initial balance
```

### Customer 2 - Sarah
```
Email:    customer2@servon.com
Password: customer123
Name:     Sarah Customer
Phone:    9876543211
Location: Delhi
Wallet:   ₹500 initial balance
```

---

## 🏪 VENDOR ACCOUNTS

### Vendor 1 - Mike's Plumbing
```
Email:    vendor@servon.com
Password: vendor123
Name:     Mike Vendor
Phone:    9123456789
Business: Mike's Plumbing Services
Category: Home Services
Services: Plumbing, Repair
Location: Mumbai
Wallet:   ₹1000 initial balance
```

### Vendor 2 - Lisa's Cleaning
```
Email:    vendor2@servon.com
Password: vendor123
Name:     Lisa Vendor
Phone:    9123456788
Business: Lisa's Cleaning Co
Category: Cleaning
Services: House Cleaning, Office Cleaning
Location: Bangalore
Wallet:   ₹1000 initial balance
```

### Vendor 3 - David's Electrical
```
Email:    vendor3@servon.com
Password: vendor123
Name:     David Vendor
Phone:    9123456787
Business: David's Electrical Solutions
Category: Electrical
Services: Electrical Repair, Installation
Location: Pune
Wallet:   ₹1000 initial balance
```

---

## 🚀 How to Use

1. **Seed the database**: Run `node seedUsers.js` from the `servon-backend` directory
2. **Start backend**: Run `npm run dev` in `servon-backend` (Port 5000)
3. **Start frontend**: Run `npm run dev` in `servon-frontend` (Port 5173)
4. **Login**: Visit http://localhost:5173 and use any credentials above

---

## 📝 Notes

- Vendors receive ₹1000 initial wallet balance
- Customers receive ₹500 initial wallet balance
- Seed script prevents duplicate user creation
- Each user automatically gets a wallet created

---

**Last Updated**: January 30, 2026
