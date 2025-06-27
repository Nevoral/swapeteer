package swap

func NewAlert(data any) *Envelope {
	return &Envelope{"alert", data}
}

func Info(title, message string, duration int) *Alert {
	return &Alert{
		Type:            "info",
		Title:           title,
		Message:         message,
		Duration:        duration,
		PrimaryColor:    "blue",
		ButtonTextColor: "white",
	}
}

func Danger(title, message string, duration int) *Alert {
	return &Alert{
		Type:            "danger",
		Title:           title,
		Message:         message,
		Duration:        duration,
		PrimaryColor:    "red",
		ButtonTextColor: "white",
	}
}
func Success(title, message string, duration int) *Alert {
	return &Alert{
		Type:            "success",
		Title:           title,
		Message:         message,
		Duration:        duration,
		PrimaryColor:    "green",
		ButtonTextColor: "white",
	}
}
func Warning(title, message string, duration int) *Alert {
	return &Alert{
		Type:            "warning",
		Title:           title,
		Message:         message,
		Duration:        duration,
		PrimaryColor:    "yellow",
		ButtonTextColor: "gray-800",
	}
}
func Dark(title, message string, duration int) *Alert {
	return &Alert{
		Type:            "dark",
		Title:           title,
		Message:         message,
		Duration:        duration,
		PrimaryColor:    "gray",
		ButtonTextColor: "white",
	}
}

type Alert struct {
	Type            string `json:"level"`
	Title           string `json:"title"`
	Message         string `json:"message"`
	Duration        int    `json:"duration"`
	PrimaryColor    string `json:"primaryColor"`
	ButtonTextColor string `json:"buttonTextColor"`
}
