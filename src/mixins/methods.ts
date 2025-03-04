export default function (Class: any, methods: Record<string, Function>): void {
  Object.entries(methods).forEach(([name, method]) => {
    Class.prototype[name] = method
  })
}
