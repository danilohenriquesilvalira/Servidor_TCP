package logger

import (
	"fmt"
	"log"
	"os"
	"runtime"
	"time"
)

type LogLevel int

const (
	DEBUG LogLevel = iota
	INFO
	WARN
	ERROR
	FATAL
)

type Logger struct {
	level LogLevel
}

var defaultLogger = &Logger{level: INFO}

func init() {
	log.SetFlags(log.LstdFlags | log.Lmicroseconds)
}

func SetLogLevel(level LogLevel) {
	defaultLogger.level = level
}

func Debug(msg string, args ...interface{}) {
	defaultLogger.log(DEBUG, msg, args...)
}

func Info(msg string, args ...interface{}) {
	defaultLogger.log(INFO, msg, args...)
}

func Warn(msg string, args ...interface{}) {
	defaultLogger.log(WARN, msg, args...)
}

func Error(msg string, args ...interface{}) {
	defaultLogger.log(ERROR, msg, args...)
}

func Fatal(msg string, args ...interface{}) {
	defaultLogger.log(FATAL, msg, args...)
	os.Exit(1)
}

func (l *Logger) log(level LogLevel, msg string, args ...interface{}) {
	if level < l.level {
		return
	}

	levelStr := l.levelString(level)
	timestamp := time.Now().Format("2006-01-02 15:04:05.000")
	
	_, file, line, ok := runtime.Caller(2)
	var location string
	if ok {
		location = fmt.Sprintf("%s:%d", file, line)
	} else {
		location = "unknown:0"
	}

	message := fmt.Sprintf(msg, args...)
	logMsg := fmt.Sprintf("[%s] %s %s - %s", levelStr, timestamp, location, message)

	switch level {
	case DEBUG, INFO:
		log.Print(logMsg)
	case WARN, ERROR, FATAL:
		log.Print(logMsg)
	}
}

func (l *Logger) levelString(level LogLevel) string {
	switch level {
	case DEBUG:
		return "DEBUG"
	case INFO:
		return "INFO"
	case WARN:
		return "WARN"
	case ERROR:
		return "ERROR"
	case FATAL:
		return "FATAL"
	default:
		return "UNKNOWN"
	}
}