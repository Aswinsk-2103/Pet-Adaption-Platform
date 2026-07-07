.pet-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.pet-card:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 28px rgba(0,0,0,0.15);
}

.pet-card-img-wrap {
  position: relative;
}

.pet-card-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.card-status-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: capitalize;
}
.card-status-badge.available { background: #e8f5e9; color: #2e7d32; }
.card-status-badge.adopted   { background: #fce4ec; color: #c62828; }

.card-fav-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}
.card-fav-btn:hover { transform: scale(1.2); }

.pet-card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.pet-card-name {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: #222;
}

.pet-card-info {
  color: #777;
  font-size: 0.88rem;
  margin: 0;
}

.pet-card-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.trait-badge {
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 0.74rem;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 600;
}

.adopt-btn {
  margin-top: auto;
  padding: 10px;
  background: #4caf50;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.adopt-btn:hover:not(:disabled) { background: #388e3c; }
.adopt-btn:disabled { background: #ccc; cursor: not-allowed; }

.view-btn {
  margin-top: auto;
  padding: 10px;
  background: #1565c0;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.view-btn:hover { background: #0d47a1; }
