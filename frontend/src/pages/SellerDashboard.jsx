// src/pages/SellerDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import popular1 from "../assets/seller-popular-1.png";
import popular2 from "../assets/seller-popular-2.png";

const ORANGE = "#ff7a00";

export default function SellerDashboard() {
  const [data, setData] = useState({
    location: "Your Restaurant",
    runningOrders: 0,
    orderRequests: 0,
    totalRevenue: 0,
    revenuePeriod: "Daily",
    reviews: { rating: 0, count: 0 },
    popularItems: [],
    restaurant: null,
    chartData: {
      labels: ['12AM', '6AM', '12PM', '6PM', '11PM'],
      values: [0, 0, 0, 0, 0],
      period: 'Daily',
      max_value: 0
    }
  });
  const [error, setError] = useState("");
  const [selectedBarIndex, setSelectedBarIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have cached data to show immediately
    const cachedData = sessionStorage.getItem('sellerDashboardData');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setData(parsed);
      } catch (e) {
        console.log('Error parsing cached data:', e);
      }
    }
    
    // Always fetch fresh data in background
    fetchDashboardData();
  }, []);

  const handlePeriodChange = (newPeriod) => {
    setSelectedBarIndex(null); // Reset selection when period changes
    fetchDashboardData(newPeriod.toLowerCase());
  };

  const handleBarClick = (index, value, label) => {
    setSelectedBarIndex(index);
  };

  const fetchDashboardData = async (period = 'daily') => {
    try {
      // Check if user is logged in and is a restaurant owner
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id || user.role !== 'restaurant') {
        navigate("/login");
        return;
      }

      console.log(`Fetching dashboard data for period: ${period}`);

      // Make all API calls in parallel for faster loading
      const [restaurantResponse, analyticsResponse, ordersResponse] = await Promise.all([
        api.get('/restaurant/profile/'),
        api.get('/restaurant/analytics/', { params: { period } }),
        api.get('/restaurant/orders/')
      ]);

      const restaurant = restaurantResponse.data;
      const analytics = analyticsResponse.data;
      const orders = ordersResponse.data || [];

      console.log('Restaurant profile:', restaurant);
      console.log('Analytics data:', analytics);
      console.log('Chart data:', analytics.chart_data);

      // Fetch popular items (non-critical, can be async)
      let popularItems = [];
      try {
        const foodResponse = await api.get('/customer/food/', {
          params: { restaurant: restaurant.id, ordering: '-orders_count' }
        });
        const foodData = foodResponse.data;
        const foods = foodData.results || foodData || [];
        popularItems = foods.slice(0, 2);
      } catch (foodError) {
        console.log("Could not fetch food items:", foodError);
        popularItems = [];
      }

      // Calculate dashboard metrics
      const runningOrders = orders.filter(order => 
        ['pending', 'preparing', 'ready_for_pickup'].includes(order.status)
      ).length;

      const orderRequests = orders.filter(order => 
        order.status === 'pending'
      ).length;

      // Ensure chart data has proper structure
      const chartData = analytics.chart_data || {
        labels: period === 'monthly' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] : ['12AM', '6AM', '12PM', '6PM', '11PM'],
        values: period === 'monthly' ? Array(12).fill(0) : Array(5).fill(0),
        period: period.charAt(0).toUpperCase() + period.slice(1),
        max_value: 0,
        total_revenue: 0,
        description: ''
      };

      // Validate chart data
      if (!Array.isArray(chartData.labels)) {
        chartData.labels = period === 'monthly' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] : ['12AM', '6AM', '12PM', '6PM', '11PM'];
      }
      if (!Array.isArray(chartData.values)) {
        chartData.values = period === 'monthly' ? Array(12).fill(0) : Array(5).fill(0);
      }
      if (typeof chartData.max_value !== 'number') chartData.max_value = 0;

      console.log('Final chart data:', chartData);

      const newData = {
        location: analytics.restaurant_address || restaurant.name || "Your Restaurant",
        runningOrders,
        orderRequests,
        totalRevenue: analytics.chart_data?.total_revenue || analytics.daily_revenue || 0,
        revenuePeriod: period.charAt(0).toUpperCase() + period.slice(1),
        reviews: {
          rating: analytics.average_rating || 0,
          count: analytics.total_reviews || 0
        },
        popularItems: popularItems.map((item, index) => ({
          id: item.id,
          name: item.name,
          image: item.image || (index === 0 ? popular1 : popular2)
        })),
        restaurant,
        chartData
      };

      setData(newData);
      
      // Cache the data for faster subsequent loads
      try {
        sessionStorage.setItem('sellerDashboardData', JSON.stringify(newData));
        sessionStorage.setItem('sellerDashboardCacheTime', Date.now().toString());
      } catch (e) {
        console.log('Could not cache dashboard data:', e);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      console.error("Error details:", error.response?.data);
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }
      
      // For other errors, just keep the default data and log the error
      console.log("Using default dashboard data due to API error");
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f3f3f3",
        display: "flex",
        justifyContent: "center",
        padding: "18px 0",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* grey page title */}
        <div
          style={{
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "#c0c0c0",
            marginBottom: 8,
            paddingLeft: 6,
          }}
        >
          Seller Dashboard Home
        </div>

        {/* main white phone card */}
        <div
          style={{
            position: "relative",
            borderRadius: 28,
            background: "#ffffff",
            boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
            padding: "14px 12px 70px",
          }}
        >
          {/* top row: menu, location, avatar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            {/* left hamburger in circle */}
            <button
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: "none",
                background: "#f4f5f8",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
              }}
            >
              ☰
            </button>

            {/* location center */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: 0.6,
                  color: ORANGE,
                  fontWeight: 700,
                }}
              >
                LOCATION
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  marginTop: 2,
                  color: "#444",
                }}
              >
                {data.location} ▼
              </div>
            </div>

            {/* right avatar circle */}
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#d5d9e6",
              }}
            />
          </div>

          {/* KPI cards row */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <StatCard value={data.runningOrders} label="RUNNING ORDERS" />
            <StatCard value={data.orderRequests} label="ORDER REQUEST" />
          </div>

          {/* Revenue + chart card */}
          <div
            style={{
              background: "#f7f8fc",
              borderRadius: 18,
              padding: "12px 10px 12px",
              marginBottom: 14,
            }}
          >
            {/* header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#a0a0aa",
                  }}
                >
                  Total Revenue ({data.revenuePeriod})
                </div>
                <div
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    marginTop: 2,
                  }}
                >
                  ৳{data.totalRevenue.toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <select
                  value={data.revenuePeriod}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  style={{
                    borderRadius: 12,
                    border: "1px solid #dde0f0",
                    padding: "3px 10px",
                    fontSize: "0.7rem",
                    background: "#ffffff",
                    outline: "none",
                    color: "#555",
                    cursor: "pointer",
                  }}
                >
                  <option value="Daily">Daily</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
                <button
                  onClick={() => navigate("/total-revenue")}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "0.7rem",
                    color: ORANGE,
                    cursor: "pointer",
                  }}
                >
                  See Details
                </button>
              </div>
            </div>

            {/* Modern Bar Chart */}
            <div style={{ marginTop: 4 }}>
              <div
                style={{
                  position: "relative",
                  height: 120,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #fff5eb 0%, #ffffff 100%)",
                  padding: "16px 12px 8px",
                  overflow: "hidden",
                }}
              >
                {/* Chart Container */}
                <div style={{
                  display: "flex",
                  alignItems: "end",
                  justifyContent: "space-between",
                  height: "70px",
                  marginBottom: "8px",
                  gap: "3px"
                }}>
                  {data.chartData.values && data.chartData.values.length > 0 ? (
                    data.chartData.values.map((value, index) => {
                      const maxValue = Math.max(...data.chartData.values);
                      const height = maxValue > 0 ? (value / maxValue) * 60 : 0;
                      const isSelected = selectedBarIndex === index;
                      const isHighest = value === maxValue && value > 0;
                      
                      return (
                        <div
                          key={index}
                          onClick={() => handleBarClick(index, value, data.chartData.labels[index])}
                          style={{
                            position: "relative",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "end",
                            cursor: "pointer",
                            padding: "2px"
                          }}
                        >
                          {/* Value label on selected bar */}
                          {isSelected && (
                            <div
                              style={{
                                position: "absolute",
                                top: "-24px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                background: "#333",
                                color: "white",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "0.6rem",
                                fontWeight: "600",
                                whiteSpace: "nowrap",
                                zIndex: 10,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                              }}
                            >
                              ৳{value >= 1000 ? `${(value/1000).toFixed(1)}k` : value.toFixed(0)}
                              {/* Tooltip arrow */}
                              <div style={{
                                position: "absolute",
                                top: "100%",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: 0,
                                height: 0,
                                borderLeft: "4px solid transparent",
                                borderRight: "4px solid transparent",
                                borderTop: "4px solid #333"
                              }} />
                            </div>
                          )}
                          
                          {/* Bar */}
                          <div
                            style={{
                              width: "100%",
                              maxWidth: "16px",
                              height: `${height}px`,
                              background: isSelected
                                ? `linear-gradient(180deg, #ff5722 0%, #ff7043 100%)`
                                : isHighest 
                                  ? `linear-gradient(180deg, ${ORANGE} 0%, #ff9533 100%)`
                                  : value > 0 
                                    ? `linear-gradient(180deg, #ffb366 0%, #ffc999 100%)`
                                    : "#f0f0f0",
                              borderRadius: "3px 3px 1px 1px",
                              transition: "all 0.2s ease",
                              boxShadow: isSelected
                                ? `0 4px 12px rgba(255, 87, 34, 0.4)`
                                : isHighest 
                                  ? `0 2px 8px rgba(255, 122, 0, 0.3)`
                                  : value > 0 
                                    ? `0 1px 3px rgba(255, 179, 102, 0.2)`
                                    : "none",
                              animation: `barGrow 0.6s ease-out ${index * 0.1}s both`,
                              transform: isSelected ? "scale(1.05)" : "scale(1)"
                            }}
                          />
                          
                          {/* Hover effect overlay */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: "20px",
                              height: `${height + 4}px`,
                              background: "transparent",
                              borderRadius: "4px",
                              transition: "background 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.target.style.background = "rgba(255, 122, 0, 0.1)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "transparent";
                            }}
                          />
                        </div>
                      );
                    })
                  ) : (
                    // Empty state
                    Array.from({length: 7}).map((_, index) => (
                      <div
                        key={index}
                        style={{
                          flex: 1,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "end"
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            maxWidth: "16px",
                            height: "8px",
                            background: "#f0f0f0",
                            borderRadius: "3px 3px 1px 1px"
                          }}
                        />
                      </div>
                    ))
                  )}
                </div>

                {/* Selected bar info */}
                {selectedBarIndex !== null && data.chartData.values[selectedBarIndex] > 0 && (
                  <div style={{
                    marginTop: "8px",
                    padding: "8px 12px",
                    background: "rgba(255, 122, 0, 0.08)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 122, 0, 0.2)"
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div style={{
                        fontSize: "0.65rem",
                        color: "#666",
                        fontWeight: "500"
                      }}>
                        {data.chartData.labels[selectedBarIndex]} • {data.revenuePeriod}
                      </div>
                      <div style={{
                        fontSize: "0.7rem",
                        color: ORANGE,
                        fontWeight: "700"
                      }}>
                        ৳{data.chartData.values[selectedBarIndex].toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                {/* X-axis labels */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.5rem",
                    color: "#999",
                    fontWeight: "500",
                    marginTop: "4px"
                  }}
                >
                  {data.chartData.labels && data.chartData.labels.length > 0 ? (
                    data.chartData.labels
                      .filter((_, index) => {
                        const totalLabels = data.chartData.labels.length;
                        if (totalLabels <= 8) return true;
                        const step = Math.ceil(totalLabels / 6);
                        return index % step === 0 || index === totalLabels - 1;
                      })
                      .map((label, index) => (
                        <span 
                          key={index} 
                          style={{ 
                            textAlign: 'center',
                            minWidth: '20px',
                            opacity: 0.8
                          }}
                        >
                          {label}
                        </span>
                      ))
                  ) : (
                    <span style={{ margin: 'auto', color: '#ccc', fontSize: '0.55rem' }}>
                      No data available
                    </span>
                  )}
                </div>

                {/* Subtle grid lines */}
                <div style={{
                  position: "absolute",
                  top: "16px",
                  left: "12px",
                  right: "12px",
                  height: "70px",
                  pointerEvents: "none",
                  zIndex: 1
                }}>
                  {[0.25, 0.5, 0.75].map((ratio, index) => (
                    <div
                      key={index}
                      style={{
                        position: "absolute",
                        top: `${(1 - ratio) * 100}%`,
                        left: 0,
                        right: 0,
                        height: "1px",
                        background: "rgba(0,0,0,0.05)",
                        borderRadius: "1px"
                      }}
                    />
                  ))}
                </div>

                {/* Chart animation styles */}
                <style>{`
                  @keyframes barGrow {
                    0% {
                      height: 0px;
                      opacity: 0;
                    }
                    100% {
                      opacity: 1;
                    }
                  }
                `}</style>
              </div>
            </div>
          </div>

          {/* Reviews card */}
          <div
            style={{
              background: "#fafbff",
              borderRadius: 18,
              padding: "10px 10px",
              marginBottom: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.8rem",
                  marginBottom: 6,
                  color: "#444",
                }}
              >
                Reviews
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.8rem",
                }}
              >
                <span
                  style={{
                    color: "#ffb400",
                    fontSize: "1rem",
                    marginTop: -2,
                  }}
                >
                  ★
                </span>
                <span style={{ fontWeight: 600 }}>{data.reviews.rating}</span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "#9a9a9a",
                  }}
                >
                  Total {data.reviews.count} Reviews
                </span>
              </div>
            </div>
            <button
              style={{
                border: "none",
                background: "transparent",
                fontSize: "0.7rem",
                color: ORANGE,
                cursor: "pointer",
              }}
            >
              See All Reviews
            </button>
          </div>

          {/* Popular items */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: "0.8rem", color: "#444" }}>
                Popular Items This Weeks
              </div>
              <button
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "0.7rem",
                  color: ORANGE,
                  cursor: "pointer",
                }}
              >
                See All
              </button>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {data.popularItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    flex: 1,
                    borderRadius: 18,
                    background: "#f7f8fc",
                    overflow: "hidden",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ height: 90, overflow: "hidden" }}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      padding: "6px 8px 8px",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* bottom nav */}
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div
      style={{
        flex: 1,
        background: "#f7f8fc",
        borderRadius: 18,
        padding: "10px 10px",
      }}
    >
      <div
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          marginBottom: 2,
          color: "#202121",
        }}
      >
        {value.toString().padStart(2, "0")}
      </div>
      <div
        style={{
          fontSize: "0.7rem",
          color: "#9a9a9a",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function BottomNav() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "absolute",
        left: 18,
        right: 18,
        bottom: 10,
        height: 50,
        borderRadius: 24,
        background: "#ffffff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        fontSize: "1.1rem",
      }}
    >
      <button style={navButtonStyle}>▦</button>
      <button 
        style={navButtonStyle}
        onClick={() => navigate("/running-orders")}
      >
        ≡
      </button>

      {/* center plus – highlighted */}
      <button
        onClick={() => navigate("/add-new-items")}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: `2px solid ${ORANGE}`,
          background: "#fffaf6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: ORANGE,
          fontSize: "1.3rem",
          marginTop: -22,
          boxShadow: "0 4px 12px rgba(255,122,0,0.55)",
          cursor: "pointer",
        }}
      >
        +
      </button>

      <button 
        style={navButtonStyle}
        onClick={() => navigate("/seller-notifications")}
      >
        🔔
      </button>
      <button 
        style={navButtonStyle}
        onClick={() => navigate("/seller-profile")}
      >
        👤
      </button>
    </div>
  );
}

const navButtonStyle = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "1.1rem",
  color: "#9a9a9a",
};
