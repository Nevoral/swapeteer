package swap

const headerName = "X-Swapeteer"

func SwapeteerResponce(e ...*Envelope) []*Envelope {
	return e
}

// Envelope is one entry in the X-Swapeteer header.
type Envelope struct {
	Type string `json:"type"`
	Data any    `json:"data"`
}

// NewSwap returns a Builder pre-populated with default
// htmx swap/settle timing and swapStyle = "innerHTML".
func NewSwap(target, content string) *Swap {
	return &Swap{
		target:  target,
		content: content,
		spec: &SwapSpec{
			SwapStyle:   "innerHTML",
			SwapDelay:   0,
			SettleDelay: 20, // htmx default
		},
		opts: &SwapOptions{},
	}
}

type (
	// Swap lets you fluently construct a swap Envelope.
	// It initializes both Spec and Option to htmx defaults
	// so you only override what you need.
	Swap struct {
		target  string
		content string
		spec    *SwapSpec
		opts    *SwapOptions
	}

	// SwapSpec mirrors your JS definition of swap behavior.
	SwapSpec struct {
		SwapStyle   SwapStyle `json:"swapStyle"`
		SwapDelay   int       `json:"swapDelay"`
		SettleDelay int       `json:"settleDelay"`

		Transition   *bool  `json:"transition,omitempty"`
		IgnoreTitle  *bool  `json:"ignoreTitle,omitempty"`
		Head         string `json:"head,omitempty"`
		Scroll       any    `json:"scroll,omitempty"` // "top"|"bottom"|number
		ScrollTarget string `json:"scrollTarget,omitempty"`
		Show         string `json:"show,omitempty"`
		ShowTarget   string `json:"showTarget,omitempty"`
		FocusScroll  *bool  `json:"focusScroll,omitempty"`
	}

	// SwapOptions mirrors (a subset of) your JS SwapOptions.
	SwapOptions struct {
		Select         string `json:"select,omitempty"`
		SelectOOB      string `json:"selectOOB,omitempty"`
		EventInfo      any    `json:"eventInfo,omitempty"`
		Anchor         string `json:"anchor,omitempty"`
		ContextElement string `json:"contextElement,omitempty"`
		Title          string `json:"title,omitempty"`
		HistoryRequest *bool  `json:"historyRequest,omitempty"`
	}

	SwapStyle string
)

const (
	InnerHTML   SwapStyle = "innerHTML"
	OuterHTML   SwapStyle = "outerHTML"
	BeforeBegin SwapStyle = "beforebegin"
	AfterBegin  SwapStyle = "afterbegin"
	BeforeEnd   SwapStyle = "beforeend"
	AfterEnd    SwapStyle = "afterend"
	Delete      SwapStyle = "delete"
	None        SwapStyle = "none"
)

// Build wires everything up into your Envelope.
func (s *Swap) Build() *Envelope {
	return &Envelope{
		Type: "swap",
		Data: struct {
			Target  string       `json:"target"`
			Content string       `json:"content"`
			Spec    *SwapSpec    `json:"spec"`
			Option  *SwapOptions `json:"option"`
		}{
			Target:  s.target,
			Content: s.content,
			Spec:    s.spec,
			Option:  s.opts,
		},
	}
}

// --- SwapSpec options ---

// SwapStyle sets the insert mode ("innerHTML", "outerHTML", etc).
func (s *Swap) WithSwapStyle(style SwapStyle) *Swap {
	s.spec.SwapStyle = style
	return s
}

// SwapDelay sets a pause (ms) before doing the swap.
func (s *Swap) WithSwapDelay(ms int) *Swap {
	s.spec.SwapDelay = ms
	return s
}

// SettleDelay sets a pause (ms) between swap and settle.
func (s *Swap) WithSettleDelay(ms int) *Swap {
	s.spec.SettleDelay = ms
	return s
}

// Transition enables or disables the View Transition API.
func (s *Swap) WithTransition(on bool) *Swap {
	s.spec.Transition = &on
	return s
}

// IgnoreTitle disables updating document.title from a <title> tag.
func (s *Swap) WithIgnoreTitle(on bool) *Swap {
	s.spec.IgnoreTitle = &on
	return s
}

// Head lets you inject additional <head> content from the response.
func (s *Swap) WithHead(html string) *Swap {
	s.spec.Head = html
	return s
}

// Scroll accepts "top"|"bottom"|number for scroll position.
func (s *Swap) WithScroll(v any) *Swap {
	s.spec.Scroll = v
	return s
}

// ScrollTarget scopes scroll: to a specific selector.
func (s *Swap) WithScrollTarget(sel string) *Swap {
	s.spec.ScrollTarget = sel
	return s
}

// Show accepts "top"|"bottom" and optional selector.
func (s *Swap) WithShow(v string) *Swap {
	s.spec.Show = v
	return s
}

// ShowTarget scopes show: to a specific selector.
func (s *Swap) WithShowTarget(sel string) *Swap {
	s.spec.ShowTarget = sel
	return s
}

// FocusScroll toggles htmx.config.defaultFocusScroll behavior.
func (s *Swap) WithFocusScroll(on bool) *Swap {
	s.spec.FocusScroll = &on
	return s
}

// --- SwapOptions — narrower overrides ---

// Select filters the response to only these elements.
func (s *Swap) WithSelect(css string) *Swap {
	s.opts.Select = css
	return s
}

// SelectOOB filters which out-of-band elements to apply.
func (s *Swap) WithSelectOOB(css string) *Swap {
	s.opts.SelectOOB = css
	return s
}

// EventInfo attaches metadata to htmx events.
func (s *Swap) WithEventInfo(info any) *Swap {
	s.opts.EventInfo = info
	return s
}

// Anchor will scroll that id into view after settling.
func (s *Swap) WithAnchor(id string) *Swap {
	s.opts.Anchor = id
	return s
}

// ContextElement scopes the swap to a shadow-root or fragment.
func (s *Swap) WithContextElement(css string) *Swap {
	s.opts.ContextElement = css
	return s
}

// Title is used when hx-history-elt is present or custom title.
func (s *Swap) WithTitle(t string) *Swap {
	s.opts.Title = t
	return s
}

// HistoryRequest tells htmx to only render hx-history-elt in the fragment.
func (s *Swap) WithHistoryRequest(on bool) *Swap {
	s.opts.HistoryRequest = &on
	return s
}
