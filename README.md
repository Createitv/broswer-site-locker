# Site Locker - Chrome Extension

> 🔒 A powerful Chrome extension that blocks specified websites until the user enters a configured password.

[中文文档](./README.zh-CN.md) | [English](./README.md)

## 🌟 Features

- **🛡️ Website Blocking**: Block specific websites or domains with password protection
- **🔐 Secure Authentication**: SHA-256 password hashing for security
- **⏰ Session Management**: Configurable session timeouts and auto-expiry
- **🌍 Multi-language Support**: Full internationalization (English/Chinese)
- **🎯 Smart Blocking**: Blocks all subpaths and subdomains of restricted sites
- **⚡ Real-time Updates**: Language changes apply instantly across all components
- **🔧 Flexible Settings**: Comprehensive configuration options
- **📱 Modern UI**: Beautiful, responsive interface with smooth animations

## 🚀 Quick Start

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd site-locker
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or npm install
   ```

3. **Build the extension**
   ```bash
   pnpm build
   # or npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `build/chrome-mv3-prod` folder

### First Time Setup

1. **Set Password**: Click the extension icon → "Manage Settings" → Set your password
2. **Add Blocked Sites**: Add websites you want to restrict (e.g., `facebook.com`, `youtube.com`)
3. **Configure Settings**: Adjust session timeout and other preferences

## 📖 How It Works

### Core Functionality

1. **Website Detection**: Monitors all tab navigation and URL changes
2. **Domain Matching**: Checks if visited sites match blocked domains
3. **Lock Screen**: Shows password prompt for unauthorized access
4. **Session Authorization**: Grants temporary access after successful authentication
5. **Auto-Expiry**: Sessions expire based on configured timeout settings

### Security Features

- **Password Hashing**: Uses SHA-256 with Web Crypto API
- **Session Isolation**: Each domain requires separate authorization
- **Timeout Protection**: Automatic session expiry prevents unlimited access
- **Restart Security**: Optional re-authentication after browser restart

## 🔧 Configuration

### Global Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Enable Site Locking | Master switch for the extension | `true` |
| Session Timeout | Minutes before re-authentication required | `30` |
| Require Password on Restart | Clear sessions when browser restarts | `true` |

### Adding Blocked Sites

**Supported formats:**
- Domain: `example.com`
- Subdomain: `subdomain.example.com` 
- With protocol: `https://example.com`
- With path: `https://example.com/path` (entire domain still blocked)

**What gets blocked:**
- `example.com` → Blocks all of `*.example.com/*`
- `notion.so` → Blocks `notion.so/workspace/page` etc.

## 🎨 User Interface

### Components

1. **🗂️ Popup**: Quick status view and management
2. **⚙️ Options Page**: Full configuration interface
3. **🔒 Lock Screen**: Password authentication overlay
4. **🌐 Language Selector**: Switch between English/Chinese

### Lock Screen Features

- **Centered Design**: Professional, non-intrusive appearance  
- **Real-time Translation**: Updates language without page refresh
- **Error Handling**: Clear feedback for authentication failures
- **Plugin Attribution**: Subtle branding in bottom corner

## 🌍 Multi-language Support

### Supported Languages

- **🇺🇸 English** (Default)
- **🇨🇳 中文简体**

### Language Features

- **Auto-Detection**: Uses browser language preference
- **Persistent Storage**: Remembers user language choice
- **Real-time Updates**: Changes apply instantly across all UI
- **Fallback Support**: Graceful degradation to English

### Switching Languages

1. Open extension options page
2. Select preferred language from "Language / 语言" section
3. Changes apply immediately to all extension components

## 🛠️ Development

### Tech Stack

- **Framework**: [Plasmo](https://plasmo.com/) - Modern browser extension framework
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Storage**: Chrome Storage API with encryption
- **Build**: Modern toolchain with hot reload

### Project Structure

```
src/
├── background.ts              # Service worker (URL monitoring)
├── content.tsx               # Content script (lock screen injection)  
├── popup.tsx                 # Extension popup interface
├── options.tsx               # Settings/configuration page
├── features/
│   ├── lock-screen.tsx       # Password authentication component
│   └── count-button.tsx      # Demo component
├── utils/
│   ├── storage.ts            # Data persistence and crypto
│   └── i18n.ts               # Internationalization system
└── style.css                # Global styles
```

### Development Commands

```bash
# Development with hot reload
pnpm dev

# Production build
pnpm build  

# Package for distribution
pnpm package
```

### Key APIs Used

- **Chrome Extensions API**: Tabs, storage, scripting, runtime
- **Web Crypto API**: SHA-256 password hashing
- **Chrome Storage**: Persistent configuration and sessions
- **Chrome Tabs**: Navigation monitoring and content injection

## 🔐 Security Considerations

### Password Security
- ✅ SHA-256 hashing (no plaintext storage)
- ✅ Secure Web Crypto API implementation
- ✅ No password transmission over network
- ✅ Local-only authentication

### Session Security  
- ✅ Domain-specific authorization
- ✅ Configurable timeout periods
- ✅ Optional restart clearing
- ✅ No cross-domain session sharing

### Data Privacy
- ✅ All data stored locally
- ✅ No external network requests
- ✅ No user tracking or analytics  
- ✅ Open source and auditable

## ⚠️ Limitations

- **Chrome Only**: Currently supports Chrome/Chromium-based browsers
- **Local Storage**: Settings don't sync across devices
- **Tab-based**: New incognito windows may bypass restrictions
- **Technical Users**: Can disable via developer tools

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)  
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
git clone <your-fork>
cd site-locker
pnpm install
pnpm dev
```

## 📄 License  

This project is licensed under a **Proprietary License** - see the [LICENSE](LICENSE) file for details.

**⚠️ Important**: This software is proprietary and unauthorized use, distribution, or modification is strictly prohibited.

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature idea? Please [open an issue](../../issues) with:

- **Bug Reports**: Steps to reproduce, expected vs actual behavior
- **Feature Requests**: Use case description and proposed implementation

## 🆘 Support  

- **Documentation**: Check this README and inline code comments
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions

## 📊 Changelog

### Version 0.0.1 (Initial Release)
- ✨ Core website blocking functionality  
- 🔐 Secure password authentication
- ⏰ Session management system
- 🌍 Multi-language support (EN/CN)
- 🎨 Modern, responsive UI
- 🛡️ Security hardening

---

**Made with ❤️ by [lingxiaoyao](mailto:xfy150150@gmail.com)**

⭐ **Star this repo if you find it helpful!**