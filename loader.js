window.swapeteer = (() => {
  const usedEvents = new Array();
  const activeEvents = new Array();
  const prefix = "sp-";
  let element = null;

  const executeModule = async (modulePath) => {
    try {
      return await import(modulePath);
    } catch (error) {
      console.error(`Failed to load module: ${modulePath}`, error);
      throw error;
    }
  };

  const handleEvent = async (event) => {
    element = event.target;
    const eventName = event.type;

    while (element && element !== document.body) {
      const attributeName = `${prefix}${eventName}`;
      if (element.hasAttribute(attributeName)) {
        const attributeValue = element.getAttribute(attributeName);

        if (
          !element.hasAttribute(`${prefix}preventDefault`) ||
          element.getAttribute(`${prefix}preventDefault`) === "false"
        ) {
          event.preventDefault();
        }

        await executeFunction(attributeValue, event);

        if (
          !element.hasAttribute(`${prefix}stopPropagation`) ||
          element.getAttribute(`${prefix}stopPropagation`) === "true"
        ) {
          event.stopPropagation();
          break;
        }
      }
      element = element.parentElement;
    }
  };

  const extractFunctionDetails = (functionPart) => {
    // Match function name and parameters
    const match = functionPart.match(/(\w+)\((.*)\)/);
    if (!match) {
      return {
        functionName: functionPart,
        parameters: [],
      };
    }

    const [_, functionName, paramsString] = match;

    // Parse parameters correctly, respecting quotes
    const parameters = [];
    let currentParam = "";
    let inQuotes = false;
    let escapeNext = false;

    for (let i = 0; i < paramsString.length; i++) {
      const char = paramsString[i];

      if (escapeNext) {
        currentParam += char;
        escapeNext = false;
        continue;
      }

      if (char === "\\") {
        escapeNext = true;
        continue;
      }

      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
        currentParam += char;
      } else if (char === "," && !inQuotes) {
        parameters.push(currentParam.trim());
        currentParam = "";
      } else {
        currentParam += char;
      }
    }

    // Don't forget the last parameter
    if (currentParam.trim()) {
      parameters.push(currentParam.trim());
    }

    return {
      functionName,
      parameters,
    };
  };

  const evaluateParameter = (param, event) => {
    switch (param) {
      case "this":
        return element;
      case "event":
        return event;
      default:
        // Handle quoted strings
        if (
          (param.startsWith('"') && param.endsWith('"')) ||
          (param.startsWith("'") && param.endsWith("'"))
        ) {
          return param.slice(1, -1);
        }
        // Handle template literals
        if (param.startsWith("`") && param.endsWith("`")) {
          return param.slice(1, -1);
        }
        // Handle numbers
        if (!isNaN(param)) {
          return Number(param);
        }
        // Handle function references
        if (typeof window[param] === "function") {
          return window[param];
        }
        return param;
    }
  };

  const executeFunction = async (attributeValue, event) => {
    const [modulePath, functionPart] = attributeValue.split("$");
    try {
      const module = await executeModule(modulePath);
      const { functionName, parameters } = extractFunctionDetails(functionPart);

      if (typeof module[functionName] === "function") {
        const evaluatedParams = parameters.map((param) =>
          evaluateParameter(param, event),
        );

        await module[functionName](...evaluatedParams);
      } else {
        throw new Error(
          `Function ${functionName} not found in module ${modulePath}`,
        );
      }
    } catch (error) {
      console.error("Execution error:", error);
    }
  };

  const activateEvents = (newEvents) => {
    for (let i = 0; i < usedEvents.length; i++) {
      if (!newEvents.includes(usedEvents[i]) && activeEvents[i]) {
        activeEvents[i] = false;
        document.removeEventListener(usedEvents[i], handleEvent, false);
        console.log(`Deactivated event ${usedEvents[i]}`);
      } else if (newEvents.includes(usedEvents[i]) && !activeEvents[i]) {
        document.addEventListener(usedEvents[i], handleEvent, false);
        activeEvents[i] = true;
        console.log(`Activated event ${usedEvents[i]}`);
      } else if (!newEvents.includes(usedEvents[i]) && !activeEvents[i]) {
        continue;
      } else {
        console.error(`Error event should not be here: ${newEvents[i]}`);
      }
    }
  };

  const scan = () => {
    const newEvents = new Array();

    for (let i = 0; i < usedEvents.length; i++) {
      if (document.querySelectorAll(`[${prefix + usedEvents[i]}]`).length > 0) {
        newEvents.push(usedEvents[i]);
      }
    }
    activateEvents(newEvents);
  };

  return {
    scan: scan,
    preload: (src) => {
      const link = document.createElement("link");
      link.rel = "modulepreload";
      link.href = src;
      document.body.appendChild(link);
    },
    addEvent: (...eventNames) => {
      for (const eventName of eventNames) {
        usedEvents.push(eventName);
        activeEvents.push(false);
      }
      scan();
    },
  };
})();

//Events could be specified from the begining or added later
document.addEventListener("DOMContentLoaded", () => {
  window.swapeteer.addEvent(
    "click",
    "submit",
    "keyup",
    "mouseout",
    "mouseleave",
  );
});
