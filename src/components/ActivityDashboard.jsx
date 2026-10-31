import "./ActivityDashboard.css";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  TrendingUp,
  Clock,
  Activity,
  ArrowUpRight,
} from "lucide-react";

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getBookmarkDate(link) {
  if (!link.createdAt) return null;

  const date = new Date(link.createdAt);
  if (Number.isNaN(date.getTime())) return null;

  return dateKey(date);
}

function getLinkUrl(url) {
  if (!url) return "#";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function startOfWeek(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);

  const day = result.getDay();
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));

  return result;
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ActivityDashboard({ links = [] }) {
  const today = new Date();
  const todayKey = dateKey(today);

  const [displayedMonth, setDisplayedMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(todayKey);

  const activity = useMemo(() => {
    const counts = {};

    links.forEach((link) => {
      const key = getBookmarkDate(link);
      if (key) counts[key] = (counts[key] || 0) + 1;
    });

    return counts;
  }, [links]);

  const todayCount = activity[todayKey] || 0;

  const weekStart = startOfWeek(today);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const thisWeekCount = links.filter((link) => {
    const key = getBookmarkDate(link);
    if (!key) return false;

    const date = new Date(`${key}T12:00:00`);
    return date >= weekStart && date < weekEnd;
  }).length;

  const thisMonthCount = links.filter((link) => {
    const key = getBookmarkDate(link);
    if (!key) return false;

    const date = new Date(`${key}T12:00:00`);

    return (
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }).length;

  const monthName = displayedMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(
    displayedMonth.getFullYear(),
    displayedMonth.getMonth(),
    1
  );

  const mondayOffset = (firstDay.getDay() + 6) % 7;

  const calendarStart = new Date(
    displayedMonth.getFullYear(),
    displayedMonth.getMonth(),
    1 - mondayOffset
  );

  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    return date;
  });

  const selectedLinks = links.filter(
    (link) => getBookmarkDate(link) === selectedDate
  );

  const selectedDateObject = new Date(`${selectedDate}T12:00:00`);

  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));

    const key = dateKey(date);

    return {
      key,
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      count: activity[key] || 0,
    };
  });

  const highestCount = Math.max(
    1,
    ...lastSevenDays.map((day) => day.count)
  );

  const recentLinks = [...links]
    .sort((a, b) => {
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    })
    .slice(0, 5);

  const changeMonth = (amount) => {
    setDisplayedMonth((previous) =>
      new Date(
        previous.getFullYear(),
        previous.getMonth() + amount,
        1
      )
    );
  };

  const goToToday = () => {
    setDisplayedMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(todayKey);
  };

  return (
    <section className="activity-dashboard">
      <div className="activity-section-heading">
        <div>
          <span className="activity-eyebrow">
            <Activity size={14} /> YOUR PROGRESS
          </span>
          <h2>Your activity</h2>
          <p>A little overview of your growing digital library.</p>
        </div>
      </div>

      <div className="activity-stats-grid">
        <motion.div className="activity-stat-card" whileHover={{ y: -4 }}>
          <div className="activity-stat-icon blue">
            <Bookmark size={19} />
          </div>
          <span>Saved today</span>
          <strong>{todayCount}</strong>
          <small>Bookmarks added today</small>
        </motion.div>

        <motion.div className="activity-stat-card" whileHover={{ y: -4 }}>
          <div className="activity-stat-icon purple">
            <TrendingUp size={19} />
          </div>
          <span>This week</span>
          <strong>{thisWeekCount}</strong>
          <small>Bookmarks added this week</small>
        </motion.div>

        <motion.div className="activity-stat-card" whileHover={{ y: -4 }}>
          <div className="activity-stat-icon pink">
            <CalendarDays size={19} />
          </div>
          <span>This month</span>
          <strong>{thisMonthCount}</strong>
          <small>Bookmarks added this month</small>
        </motion.div>
      </div>

      <div className="activity-main-grid">
        <div className="activity-panel calendar-panel">
          <div className="activity-panel-heading">
            <div>
              <h3>Saved history</h3>
              <p>Select a day to explore your bookmarks.</p>
            </div>

            <button className="calendar-today-button" onClick={goToToday}>
              Today
            </button>
          </div>

          <div className="calendar-navigation">
            <h3>{monthName}</h3>

            <div>
              <button onClick={() => changeMonth(-1)} aria-label="Previous month">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => changeMonth(1)} aria-label="Next month">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div className="calendar-weekday" key={day}>
                {day}
              </div>
            ))}

            {calendarDays.map((date) => {
              const key = dateKey(date);
              const isCurrentMonth =
                date.getMonth() === displayedMonth.getMonth() &&
                date.getFullYear() === displayedMonth.getFullYear();

              const isToday = key === todayKey;
              const isSelected = key === selectedDate;
              const hasActivity = Boolean(activity[key]);

              return (
                <button
                  key={key}
                  className={[
                    "calendar-day",
                    !isCurrentMonth ? "outside-month" : "",
                    isToday ? "today" : "",
                    isSelected ? "selected" : "",
                    hasActivity ? "has-activity" : "",
                  ].join(" ")}
                  onClick={() => setSelectedDate(key)}
                  aria-label={`${formatDate(date)}, ${activity[key] || 0} bookmarks saved`}
                >
                  <span>{date.getDate()}</span>
                  {hasActivity && <i />}
                </button>
              );
            })}
          </div>

          <div className="calendar-legend">
            <span><i /> Activity recorded</span>
            <span><i className="legend-selected" /> Selected day</span>
          </div>

          <div className="selected-day-activity">
            <div className="selected-day-heading">
              <div>
                <span>SELECTED DATE</span>
                <h4>{formatDate(selectedDateObject)}</h4>
              </div>
              <strong>
                {selectedLinks.length}{" "}
                {selectedLinks.length === 1 ? "link" : "links"}
              </strong>
            </div>

            {selectedLinks.length > 0 ? (
              <div className="selected-day-list">
                {selectedLinks.map((link) => (
                  <a
                    href={getLinkUrl(link.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="activity-link-item"
                    key={link.id}
                  >
                    <div>
                      <strong>{link.title}</strong>
                      <span>{link.url}</span>
                    </div>
                    <ArrowUpRight size={16} />
                  </a>
                ))}
              </div>
            ) : (
              <div className="activity-empty">
                <CalendarDays size={20} />
                <span>No bookmarks saved on this day.</span>
              </div>
            )}
          </div>
        </div>

        <div className="activity-panel weekly-panel">
          <div className="activity-panel-heading">
            <div>
              <h3>Weekly activity</h3>
              <p>Your last seven days at a glance.</p>
            </div>
            <div className="weekly-heading-icon">
              <TrendingUp size={19} />
            </div>
          </div>

          <div className="weekly-total">
            <strong>
              {lastSevenDays.reduce((total, day) => total + day.count, 0)}
            </strong>
            <span>links saved in the last 7 days</span>
          </div>

          <div className="weekly-chart">
            {lastSevenDays.map((day) => (
              <div className="weekly-chart-column" key={day.key}>
                <span className="weekly-bar-value">
                  {day.count > 0 ? day.count : ""}
                </span>

                <div className="weekly-bar-track">
                  <motion.div
                    className="weekly-bar"
                    initial={{ height: 0 }}
                    animate={{
                      height: `${(day.count / highestCount) * 100}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <span className="weekly-day-label">{day.label}</span>
              </div>
            ))}
          </div>

          <div className="weekly-insight">
            <Clock size={17} />
            <span>
              Every saved link adds to your personal knowledge library.
            </span>
          </div>
        </div>
      </div>

      <div className="activity-panel recent-activity-panel">
        <div className="activity-panel-heading">
          <div>
            <h3>Recently added</h3>
            <p>Your latest additions to Linkspace.</p>
          </div>
        </div>

        {recentLinks.length > 0 ? (
          <div className="recent-activity-list">
            {recentLinks.map((link) => (
              <a
                href={getLinkUrl(link.url)}
                target="_blank"
                rel="noreferrer"
                className="recent-activity-item"
                key={link.id}
              >
                <div className="recent-activity-icon">
                  <Bookmark size={17} />
                </div>

                <div className="recent-activity-info">
                  <strong>{link.title}</strong>
                  <span>{link.url}</span>
                </div>

                <span className="recent-activity-category">
                  {link.category}
                </span>

                <ArrowUpRight size={17} />
              </a>
            ))}
          </div>
        ) : (
          <div className="activity-empty">
            <Bookmark size={20} />
            <span>Your recent bookmarks will appear here.</span>
          </div>
        )}
      </div>
    </section>
  );
}
