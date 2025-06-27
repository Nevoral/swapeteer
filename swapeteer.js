htmx.on("htmx:afterRequest", (evt) => {
  let xhr = evt.detail.xhr;
  let header = xhr.getResponseHeader("X-Swapeteer");
  if (!header) return;
  let swaps = JSON.parse(header);

  swaps.forEach((swap) => {
    switch (swap.type) {
      case "alert":
        showAlert(swap.data);
        break;
      case "swap":
        htmx.swap(
          swap.data.target,
          swap.data.content,
          swap.data.spec,
          swap.data.option,
        );
        break;
    }
  });
});

export const Info = (title, message, duration = 5000) => {
  showAlert({ type: "info", title, message, duration, primaryColor: "blue" });
};
export const Danger = (title, message, duration = 5000) => {
  showAlert({ type: "danger", title, message, duration, primaryColor: "red" });
};
export const Success = (title, message, duration = 5000) => {
  showAlert({
    type: "success",
    title,
    message,
    duration,
    primaryColor: "green",
  });
};
export const Warning = (title, message, duration = 5000) => {
  showAlert({
    type: "warning",
    title,
    message,
    duration,
    primaryColor: "yellow",
    secondaryColor: "gray-800",
  });
};
export const Dark = (title, message, duration = 5000) => {
  showAlert({ type: "dark", title, message, duration, primaryColor: "gray" });
};

export const showAlert = ({
  type,
  title,
  message,
  duration = 5000,
  primaryColor,
  buttonTextColor = "white",
}) => {
  const container = document.getElementById("alert-container");
  if (!container) {
    console.error(`Alert container not found`);
    return;
  }

  // 1) Inject the HTML string directly into your container
  container.insertAdjacentHTML("beforeend", alertTemplate());

  // 2) Grab the newly-added element
  const alertElement = container.lastElementChild;
  if (!alertElement) {
    console.error("Failed to append alert");
    return;
  }

  // Animation helpers
  const resetAnimation = (el) => {
    const circle = el.querySelector("circle");
    if (circle) {
      circle.style.transition = "none";
      circle.style.strokeDashoffset = "125";
    }
    return circle;
  };

  const circleAnimation = (el) => {
    const circle = resetAnimation(el);
    // Force reflow
    circle.getBoundingClientRect();
    const radius = 10;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = "125";
    circle.style.transition = `stroke-dashoffset ${duration}ms linear`;

    setTimeout(() => {
      circle.style.strokeDashoffset = circumference;
    }, 10);
  };

  // Positioning & removal
  const removeAlert = (el) => {
    if (el.timeoutId) clearTimeout(el.timeoutId);
    el.classList.add("-translate-y-full", "opacity-0");
    setTimeout(() => {
      el.remove();
      updateAlertPositions();
    }, 300);
  };

  const updateAlertPositions = () => {
    const alerts = container.querySelectorAll(":scope > div");
    alerts.forEach((el, idx) => {
      el.style.zIndex = 1000 - idx;
      if (el.timeoutId) {
        clearTimeout(el.timeoutId);
        resetAnimation(el);
      }
      if (idx >= 3) {
        el.classList.add("hidden");
      } else {
        el.classList.remove("hidden");
        if (idx === 0) {
          circleAnimation(el);
          el.timeoutId = setTimeout(() => removeAlert(el), duration);
        }
        el.style.transform = `
          translateY(${-idx * 120}px)
          scale(${100 - idx * 10}%)
        `;
        el.style.opacity = Math.max(0.8 - idx * 0.15, 0.5);
      }
    });
  };

  // Bring a clicked alert to front
  const bringToFront = () => {
    container.removeChild(alertElement);
    container.prepend(alertElement);
    updateAlertPositions();
    alertElement.timeoutId = setTimeout(
      () => removeAlert(alertElement),
      duration,
    );
  };

  // Wire up close & expand buttons
  const closeBtn = alertElement.querySelector('button[aria-label="Close"]');
  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      removeAlert(alertElement);
    };
  }
  const expandBtn = alertElement.querySelector(
    'button:not([aria-label="Close"])',
  );
  if (expandBtn) {
    expandBtn.onclick = (e) => {
      e.stopPropagation();
      const truncated = alertElement.querySelector(".truncated-text");
      const full = alertElement.querySelector(".full-text");
      const span = expandBtn.querySelector("span");
      if (truncated.classList.contains("hidden")) {
        truncated.classList.remove("hidden");
        full.classList.add("hidden");
        span.textContent = "Rozbalit";
      } else {
        truncated.classList.add("hidden");
        full.classList.remove("hidden");
        span.textContent = "Sbalit";
      }
    };
  }

  alertElement.addEventListener("click", bringToFront);

  // Initial insertion & entrance animation
  container.appendChild(alertElement);
  updateAlertPositions();
  setTimeout(() => {
    alertElement.classList.remove("-translate-y-full", "opacity-0");
  }, 10);

  const alertTemplate = () => {
    return `
      <div
       	id="alert-body"
       	class="p-4 mb-4 w-96 transform translate-x-full transition-all duration-200 ease-in-out relative shadow-lg opacity-50 hover:-translate-y-1 hover:shadow-xl hover:opacity-100 text-${primaryColor}-800 border border-${primaryColor}-300 rounded-lg bg-${primaryColor}-50 dark:bg-gray-800 dark:text-${primaryColor}-400 dark:border-${primaryColor}-800"
       	role="alert"
       >
       	<div class="flex items-center">
           	<div class="relative w-8 h-8 me-2">
               	<svg class="absolute inset-0 w-8 h-8" viewBox="0 0 24 24">
                   	<circle
                       	class="animate-loader text-${primaryColor}-200 dark:text-${primaryColor}-700"
                       	cx="12"
                       	cy="12"
                       	r="10"
                       	stroke="currentColor"
                       	stroke-width="2"
                       	fill="none"
                       	style="animation-duration: 5s"
                       	transform="rotate(-90 12 12)"
                   	></circle>
               	</svg>
               	<svg
                   	class="absolute inset-2 w-4 h-4"
                   	aria-hidden="true"
                   	xmlns="http://www.w3.org/2000/svg"
                   	fill="currentColor"
                   	viewBox="0 0 20 20"
               	>
                   	<path
                       	d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
                   	/>
               	</svg>
           	</div>
           	<span class="sr-only">Info</span>
           	<h3
               	class="text-lg font-medium text-pretty"
               	id="${type}-alert-title"
           	>${title}</h3>
       	</div>
       	<div class="mt-2 mb-4 text-sm" id="${type}-alert-message">
           	<div class="truncated-text text-pretty line-clamp-1">${message}</div>
           	<div class="full-text text-pretty hidden">${message}</div>
       	</div>
       	<div class="flex">
           	<button
               	type="button"
               	class="text-${buttonTextColor} bg-${primaryColor}-800 hover:bg-${primaryColor}-900 focus:ring-4 focus:outline-none focus:ring-${primaryColor}-200 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center dark:bg-${primaryColor}-600 dark:hover:bg-${primaryColor}-700 dark:focus:ring-${primaryColor}-800"
           	>
               	<svg
                   	class="me-2 h-3 w-3"
                   	aria-hidden="true"
                   	xmlns="http://www.w3.org/2000/svg"
                   	fill="currentColor"
                   	viewBox="0 0 20 14"
               	>
                   	<path
                       	d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
                   	/>
               	</svg>
               	<span>Rozbalit</span>
           	</button>
           	<button
               	type="button"
               	class="text-${primaryColor}-800 bg-transparent border border-${primaryColor}-800 hover:bg-${primaryColor}-900 hover:text-${buttonTextColor} focus:ring-4 focus:outline-none focus:ring-${primaryColor}-200 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:hover:bg-${primaryColor}-600 dark:border-${primaryColor}-600 dark:text-${primaryColor}-400 dark:hover:text-${buttonTextColor} dark:focus:ring-${primaryColor}-800"
               	data-dismiss-target="#alert-additional-content-1"
               	aria-label="Close"
           	>
               	<span>Zavřít</span>
           	</button>
       	</div>
       </div>`;
  };
};
