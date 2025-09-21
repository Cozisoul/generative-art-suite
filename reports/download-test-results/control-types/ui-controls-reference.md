# UI Controls Reference

## 📋 Control Types Overview

This document provides a comprehensive reference for all UI controls used across the 9 generators in the suite.

## 🎛️ Control Categories

### Input Controls
- **Slider**: Range input with min/max values
- **Number Input**: Numeric input with validation
- **Text Input**: Single-line text entry
- **Textarea**: Multi-line text entry
- **Color Input**: Color picker with hex values
- **Checkbox**: Boolean true/false input
- **Select**: Dropdown selection from options
- **File Input**: File upload for images

### Display Controls
- **Label**: Text labels for controls
- **Fieldset**: Grouped control containers
- **Button**: Action triggers
- **Preview**: Live preview elements

## 🎨 Control Specifications

### Slider Control
```javascript
_createSlider(settingKey, labelText, options = {})
```

**Options:**
- `min`: Minimum value (number)
- `max`: Maximum value (number)
- `step`: Step increment (number)
- `unit`: Display unit (string)
- `defaultValue`: Initial value (number)

**Examples:**
- Font size: `{ min: 20, max: 400, step: 1, unit: 'px' }`
- Opacity: `{ min: 0, max: 1, step: 0.01 }`
- Rotation: `{ min: -90, max: 90, step: 1, unit: '°' }`

**Used in:**
- Grid Generator: 15+ sliders
- Swiss Generator: 12+ sliders
- Bauhaus Generator: 8+ sliders
- Abstract Film: 20+ sliders
- Grid Tool: 10+ sliders
- Logo Generator: 8+ sliders
- Vera Molnar: 6+ sliders
- 3D Generator: 3+ sliders

### Color Input Control
```javascript
_createColorInput(settingKey, labelText)
```

**Features:**
- Hex color picker
- Real-time preview
- Color validation
- Accessibility support

**Examples:**
- Background color
- Text color
- Accent color
- Mark color

**Used in:**
- All generators (2-5 color inputs each)

### Text Input Control
```javascript
_createTextInput(settingKey, labelText, options = {})
```

**Options:**
- `placeholder`: Placeholder text
- `maxLength`: Maximum character limit
- `multiline`: Enable textarea mode

**Examples:**
- Logo text
- Title text
- Tagline text
- Custom characters

**Used in:**
- Swiss Generator: 3 text inputs
- Bauhaus Generator: 3 text inputs
- Logo Generator: 2 text inputs
- Abstract Film: 1 text input

### Select Control
```javascript
_createSelect(settingKey, labelText, options, options = {})
```

**Options:**
- `options`: Array of option values
- `labels`: Array of display labels
- `defaultValue`: Initial selection

**Examples:**
- Font family selection
- Design style selection
- Preset selection
- Effect type selection

**Used in:**
- All generators (2-8 selects each)

### Checkbox Control
```javascript
_createCheckbox(settingKey, labelText, options = {})
```

**Options:**
- `defaultValue`: Initial checked state
- `disabled`: Disabled state

**Examples:**
- Enable animation
- Show grid
- Use diagonals
- Transparent background

**Used in:**
- Grid Generator: 4 checkboxes
- Swiss Generator: 2 checkboxes
- Bauhaus Generator: 1 checkbox
- Abstract Film: 3 checkboxes
- Grid Tool: 2 checkboxes
- Logo Generator: 4 checkboxes
- Vera Molnar: 1 checkbox

### Number Input Control
```javascript
_createNumberInput(settingKey, labelText, min, max, step)
```

**Features:**
- Numeric validation
- Min/max constraints
- Step increment
- Real-time validation

**Examples:**
- Rotation speed
- Frame rate
- Grid count
- Animation duration

**Used in:**
- 3D Generator: 3 number inputs
- Abstract Film: 2 number inputs
- Grid Tool: 2 number inputs

### Fieldset Control
```javascript
_createfieldset(title, options = {})
```

**Features:**
- Collapsible groups
- Toggle functionality
- Visual grouping
- Accessibility support

**Options:**
- `collapsible`: Enable toggle
- `defaultOpen`: Initial state
- `icon`: Custom icon

**Examples:**
- "Page Setup"
- "Typography"
- "Color"
- "Animation"
- "Effects"

**Used in:**
- All generators (3-8 fieldsets each)

## 🎯 Generator-Specific Controls

### Grid Generator Controls
- **Grid System**: Select (uniform, randomized)
- **Shape Type**: Select (rectangle, circle, arc, triangle, word, truchet)
- **Blend Mode**: Select (7 blend modes)
- **Color Palette**: Select (9 palettes)
- **Animation**: Checkbox + speed slider
- **Text Content**: Text input
- **Font Settings**: Select + slider

### Swiss Generator Controls
- **Design Style**: Select (Swiss, Bauhaus, Brutalist)
- **Scenario**: Select (7 scenarios)
- **Typography**: Multiple text inputs + sliders
- **Graphic Elements**: Count sliders for shapes
- **Layout**: Column and margin controls
- **Color**: Background, text, accent colors

### Bauhaus Generator Controls
- **Shape Count**: Slider (1-50)
- **Shape Size**: Min/max sliders
- **Diagonals**: Checkbox + count slider
- **Typography**: Text inputs + size sliders
- **Color Palette**: 4 color inputs
- **Text Rotation**: Angle slider

### Abstract Film Generator Controls
- **Film Stock**: Select (4 types)
- **Effects**: 15+ effect sliders
- **Animation**: Speed and pattern controls
- **Shapes**: Count and style controls
- **Visual Effects**: Grain, vignette, bloom
- **Content**: Title text and size

### Grid Tool Generator Controls
- **Grid Type**: Select (4 types)
- **Layout**: Column/row sliders
- **Spacing**: Gutter and margin controls
- **Typography**: Font and spacing controls
- **Export**: Format and resolution selects
- **Visual**: Grid visibility and color

### Image Manipulator Controls
- **File Upload**: File input
- **Effect Type**: Select (7 effects)
- **Effect Settings**: Effect-specific sliders
- **Adjustments**: Brightness/contrast sliders
- **Preview**: Live effect preview

### Logo Generator Controls
- **Design Style**: Select (3 styles)
- **Typography**: Font, size, weight, spacing
- **Mark**: Type, complexity, size, position
- **Color**: Background, text, mark colors
- **Palette**: Predefined color palettes
- **Brutalist**: Distress, jitter, grid controls

### Vera Molnar Generator Controls
- **Grid**: Count and margin sliders
- **Shapes**: Type and disorder sliders
- **Animation**: Speed and simulation controls
- **Color**: Background and line colors
- **Disorder**: Position, rotation, size disorder

### 3D Generator Controls
- **Shape**: Select (7 shapes)
- **Material**: Color + type select
- **Rotation**: X, Y, Z speed controls
- **Animation**: Built-in rotation

## 🎨 Control Styling

### Visual Design
- **Consistent Spacing**: 16px margins
- **Typography**: System font stack
- **Colors**: Accessible color contrast
- **Focus States**: Clear focus indicators
- **Hover Effects**: Subtle interactions

### Accessibility
- **Labels**: Proper label associations
- **ARIA**: Screen reader support
- **Keyboard**: Full keyboard navigation
- **Focus**: Logical tab order
- **Contrast**: WCAG AA compliance

### Responsive Design
- **Mobile**: Touch-friendly controls
- **Tablet**: Optimized spacing
- **Desktop**: Full feature set
- **Flexible**: Adapts to container width

## ⚙️ Technical Implementation

### Event Handling
- **Input Events**: Real-time updates
- **Change Events**: Final value updates
- **Custom Events**: Generator-specific events
- **Debouncing**: Performance optimization

### State Management
- **Settings Object**: Centralized state
- **Validation**: Input validation
- **Persistence**: Local storage
- **Reset**: Default value restoration

### Performance
- **Lazy Loading**: Controls loaded on demand
- **Debouncing**: Reduced update frequency
- **Memory**: Efficient event handling
- **Rendering**: Optimized DOM updates
