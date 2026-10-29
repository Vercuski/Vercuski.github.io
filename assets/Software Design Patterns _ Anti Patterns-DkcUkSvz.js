const e=`---
type: reference
domain:
- '[[Design Patterns]]'
status: draft
summary: "Index of classic object-level design patterns (creational, structural, behavioral, concurrency) and named anti-patterns; every row links to its own pattern note."
aliases:
- GoF Patterns
- Design Patterns Catalog
- GoF & Classic Patterns
- Anti-Patterns Catalog
- Anti Patterns
created: 2026-09-16
updated: 2026-10-28
tags:
- cheatsheet
- anti_pattern
---
> [!summary] TL;DR
> A lookup table of classic design patterns grouped as creational, structural, behavioral and concurrency, followed by named anti-patterns. Each name links to its own note (problem, solution, structure, when to use, trade-offs); pattern notes live in \`Design Patterns/Classic Patterns\` and anti-pattern notes in \`Design Patterns/Anti-Patterns\`. The [[Pattern Catalog.base|Pattern Catalog]] lists them all by category. Distributed-systems patterns are in [[Distributed Systems Pattern Catalog]]; architecture styles are in [[Architecture Styles Compared]].

# Patterns
### Links
- https://java-design-patterns.com/
- https://www.tutorialspoint.com/design_pattern/index.htm
### Enterprise application patterns
Distributed-systems patterns (API Gateway, Circuit Breaker, CQRS, Event Sourcing, Outbox, Retry, Saga) live in [[Distributed Systems Pattern Catalog]]; cache-aside lives in [[Caching Patterns]].

| Name | Description |
| --- | --- |
| [[Entity Component System]] | Entities are composed of data components, and systems operate on entities that have particular components. Most associated with game development for representing game-world objects. |
| [[Pipeline Pattern]] | Executes cross-cutting concerns such as validation and logging before or after handlers. |
| [[Repository Pattern]] | Encapsulates data access and keeps business logic independent of persistence. With EF Core, \`DbContext\` and \`DbSet\` already play this role; see [[7 .NET Habits to Reconsider]]. |
### Creational
A [creational pattern](https://en.wikipedia.org/wiki/Creational_pattern "Creational pattern") creates objects.

| Name | Description |
| --- | --- |
| [[Abstract Factory]] | Provide an interface for creating _families_ of related or dependent objects without specifying their concrete classes.<br>**Example:** GUI Factory |
| [[Builder Pattern]] | Separate the construction of a complex object from its representation, allowing the same construction process to create various representations.<br>**Example:** StringBuilder |
| [[Dependency Injection]] | A class accepts the objects it requires from an injector instead of creating the objects directly. |
| [[Factory Method]] | Define an interface for creating a _single_ object, but let subclasses decide which class to instantiate. Factory Method lets a class defer instantiation to subclasses.<br>**Example:** Shape Factory |
| [[Lazy Initialization]] | Tactic of delaying the creation of an object, the calculation of a value, or some other expensive process until the first time it is needed. This pattern appears in the GoF catalog as "virtual proxy", an implementation strategy for the Proxy pattern. |
| [[Multiton Pattern]] | Ensure a class has only named instances, and provide a global point of access to them. |
| [[Object Pool]] | Avoid expensive acquisition and release of resources by recycling objects that are no longer in use. Can be considered a generalisation of connection pool and thread pool patterns. |
| [[Prototype Pattern]] | Specify the kinds of objects to create using a prototypical instance, and create new objects from the 'skeleton' of an existing object, thus boosting performance and keeping memory footprints to a minimum.<br>**Example:** Object.clone() |
| [[Resource Acquisition Is Initialization]] | Ensure that resources are properly released by tying them to the lifespan of suitable objects. |
| [[Singleton Pattern]] | Ensure a class has only one instance, and provide a global point of access to it.<br>**Example:** Logger |
### Structural
A [structural pattern](https://en.wikipedia.org/wiki/Structural_pattern "Structural pattern") organizes classes and objects to form larger structures that provide new functionality.

| Name | Description |
| --- | --- |
| [[Adapter Pattern]] | Convert the interface of a class into another interface clients expect. An adapter lets classes work together that could not otherwise because of incompatible interfaces. The enterprise integration pattern equivalent is the translator.<br>**Example:** SocketAdapter |
| [[Bridge Pattern]] | Decouple an abstraction from its implementation allowing the two to vary independently.<br>**Example:** JDBC Driver |
| [[Composite Pattern]] | Compose objects into tree structures to represent part-whole hierarchies. Composite lets clients treat individual objects and compositions of objects uniformly.<br>**Example:** File System |
| [[Decorator Pattern]] | Attach additional responsibilities to an object dynamically keeping the same interface. Decorators provide a flexible alternative to subclassing for extending functionality.<br>**Example:** I/O Streams |
| [[Delegation Pattern]] | Extend a class by composition instead of subclassing. The object handles a request by delegating to a second object (the delegate) |
| [[Extension Object]] | Adding functionality to a hierarchy without changing the hierarchy. |
| [[Facade Pattern]] | Provide a unified interface to a set of interfaces in a subsystem. Facade defines a higher-level interface that makes the subsystem easier to use.<br>**Example:** JDBC Template |
| [[Flyweight Pattern]] | Use sharing to support large numbers of similar objects efficiently.<br>**Example:** Character Cache |
| [[Front Controller]] | The pattern relates to the design of Web applications. It provides a centralized entry point for handling requests. |
| [[Marker Interface]] | Empty interface to associate metadata with a class. |
| [[Module Pattern]] | Group several related elements, such as classes, singletons, methods, globally used, into a single conceptual entity. |
| [[Proxy Pattern]] | Provide a surrogate or placeholder for another object to control access to it.<br>**Example:** Virtual Proxy |
| [[Twin Pattern]] | Twin allows modeling of multiple inheritance in programming languages that do not support this feature. |
### Behavioral
A [behavioral pattern](https://en.wikipedia.org/wiki/Behavioral_pattern "Behavioral pattern") describes collaboration between objects.

| Name | Description |
| --- | --- |
| [[Blackboard Pattern]] | Artificial intelligence pattern for combining disparate sources of data (see blackboard system) |
| [[Chain of Responsibility]] | Avoid coupling the sender of a request to its receiver by giving more than one object a chance to handle the request. Chain the receiving objects and pass the request along the chain until an object handles it.<br>**Example:** Filter Chain |
| [[Command Pattern]] | Encapsulate a request as an object, thereby allowing for the parameterization of clients with different requests, and the queuing or logging of requests. It also allows for the support of undoable operations.<br>**Example:** Runnable |
| [[Fluent Interface]] | Design an API to be method chained so that it reads like a DSL. Each method call returns a context through which the next logical method call(s) are made available. |
| [[Interpreter Pattern]] | Given a language, define a representation for its grammar along with an interpreter that uses the representation to interpret sentences in the language.<br>**Example:** SQL Parser |
| [[Iterator Pattern]] | Provide a way to access the elements of an aggregate object sequentially without exposing its underlying representation.<br>**Example:** Iterator, List Iterator |
| [[Mediator Pattern]] | Define an object that encapsulates how a set of objects interact. Mediator promotes loose coupling by keeping objects from referring to each other explicitly, and it allows their interaction to vary independently.<br>**Example:** Chat Room |
| [[Memento Pattern]] | Without violating encapsulation, capture and externalize an object's internal state allowing the object to be restored to this state later.<br>**Example:** Undo Mechanism |
| [[Null Object]] | Avoid null references by providing a default object. |
| [[Observer Pattern]] | Define a one-to-many dependency between objects where a state change in one object results in all its dependents being notified and updated automatically.<br>**Example:** Event Listeners |
| [[Result Pattern]] | Return explicit success or failure instead of relying on exceptions for expected failures. |
| [[Servant Pattern]] | Define common functionality for a group of classes. The servant pattern is also frequently called helper class or utility class implementation for a given set of classes. The helper classes generally have no objects hence they have all static methods that act upon different kinds of class objects. |
| [[Specification Pattern]] | Recombinable business logic in a Boolean fashion. |
| [[State Pattern]] | Allow an object to alter its behavior when its internal state changes. The object will appear to change its class.<br>**Example:** ATM States |
| [[Strategy Pattern]] | Define a family of algorithms, encapsulate each one, and make them interchangeable. Strategy lets the algorithm vary independently from clients that use it.<br>**Example:** Payment Methods |
| [[Template Method]] | Define the skeleton of an algorithm in an operation, deferring some steps to subclasses. Template method lets subclasses redefine certain steps of an algorithm without changing the algorithm's structure.<br>**Example:** AbstractClass.execute() |
| [[Visitor Pattern]] | Represent an operation to be performed on instances of a set of classes. Visitor lets a new operation be defined without changing the classes of the elements on which it operates.<br>**Example:** Document Export |
### Concurrency
A [concurrency pattern](https://en.wikipedia.org/wiki/Concurrency_pattern "Concurrency pattern") supports [concurrent processing](https://en.wikipedia.org/wiki/Concurrency_\\(computer_science\\) "Concurrency (computer science)").

| Name | Description |
| --- | --- |
| [[Active Object]] | Decouples method execution from method invocation that reside in their own thread of control. The goal is to introduce concurrency, by using asynchronous method invocation and a scheduler") for handling requests. |
| [[Balking Pattern]] | Only execute an action on an object when the object is in a particular state. |
| [[Binding Properties]] | Combining multiple observers to force properties in different objects to be synchronized or coordinated in some way. |
| [[Compute Kernel]] | The same calculation many times in parallel, differing by integer parameters used with non-branching pointer math into shared arrays, such as GPU-optimized Matrix multiplication or Convolutional neural network. |
| [[CPU Atomic Operation]] | x86 and other CPU architectures support a range of atomic instructions that guarantee memory safety for modifying and accessing primitive values (integers). For example, two threads may both increment a counter safely. These capabilities can also be used to implement the mechanisms for other concurrency patterns as above. The C#") language uses the Interlocked class for these capabilities. |
| [[Double-Checked Locking]] | Reduce the overhead of acquiring a lock by first testing the locking criterion (the 'lock hint') in an unsafe manner; only if that succeeds does the actual locking logic proceed.<br><br>Can be unsafe when implemented in some language/hardware combinations. It can therefore sometimes be considered an anti-pattern. |
| [[Event-Based Asynchronous Pattern]] | Addresses problems with the asynchronous pattern that occur in multithreaded programs. |
| [[Guarded Suspension]] | Manages operations that require both a lock to be acquired and a precondition to be satisfied before the operation can be executed. |
| [[Join Pattern]] | Join-pattern provides a way to write concurrent, parallel and distributed programs by message passing. Compared to the use of threads and locks, this is a high-level programming model. |
| [[Lock Pattern]] | One thread puts a "lock" on a resource, preventing other threads from accessing or modifying it. |
| [[Messaging Design Pattern]] | Allows the interchange of information (i.e. messages) between components and applications. |
| [[Monitor Object]] | An object whose methods are subject to mutual exclusion, thus preventing multiple objects from erroneously trying to use it at the same time. |
| [[Reactor Pattern]] | A reactor object provides an asynchronous interface to resources that must be handled synchronously. |
| [[Read-Write Lock]] | Allows concurrent read access to an object, but requires exclusive access for write operations. An underlying semaphore might be used for writing, and a Copy-on-write mechanism may or may not be used. |
| [[Safe Concurrency with Exclusive Ownership]] | Avoiding the need for runtime concurrent mechanisms, because exclusive ownership can be proven. This is a notable capability of the Rust language, but compile-time checking isn't the only means, a programmer will often manually design such patterns into code - omitting the use of locking mechanism because the programmer assesses that a given variable is never going to be concurrently accessed. |
| [[Scheduler Pattern]] | Explicitly control when threads may execute single-threaded code. |
| [[Service Handler Pattern]] | For each request, a server spawns a dedicated client handler to handle a request. Also referred to as _thread-per-session_. |
| [[Thread Pool]] | A number of threads are created to perform a number of tasks, which are usually organized in a queue. Typically, there are many more tasks than threads. Can be considered a special case of the object pool pattern. |
| [[Thread-Specific Storage]] | Static or "global" memory local to a thread. |
# Anti Patterns

### Generic
| Name | Description |
| --- | --- |
| [[Abstraction Inversion]] | Users need functions implemented within an object but not exposed by the interface. |
| [[Ambiguous Viewpoint]] | Lack of clarity during software design |
| [[Big Ball of Mud]] | A software system that lacks a perceivable architecture. Although undesirable from a software engineering point of view, such systems are common in practice due to business pressures, developer turnover and software entropy. |
| [[Database-as-IPC]] | Misusing databases for temporary messages |
| [[Inner-Platform Effect]] | Tendency of software architects to replicate their development platform |
| [[Input Kludge]] | Code fails to properly validate or sanitize user input, handling it in an ad-hoc/inconsistent manner. |
| [[Interface Bloat]] | Overload of elements on an interface |
| [[Magic Pushbutton]] | User interface and business logic coupled through a single button click. |
| [[Race Hazard]] | When a system's behavior depends on timing of uncontrollable events |
| [[Stovepipe System]] | Isolated IT system. For the architecture version, see [[Stovepipe Architecture Anti-Pattern]]. |
### Object-oriented
| Name | Description |
| --- | --- |
| [[Anemic Domain Model]] | Domain objects hold data but no behavior; the business logic lives in separate service classes. |
| [[Call Super]] | A subclass override is required to call the base-class method for the code to work. |
| [[Circle-Ellipse Problem]] | A subtype that can't honor all of its supertype's behavior (a circle can't stretch like an ellipse), breaking substitutability. |
| [[Circular Dependency]] | Two or more modules depend on each other directly or indirectly, so neither can change or be reused alone. |
| [[Constant Interface]] | An interface used only to hold constants, leaking implementation details into every implementing class. |
| [[God Object]] | A single class handles all control in a program rather than control being distributed across multiple classes. |
| [[Object Cesspool]] | Reusing pooled objects whose state wasn't reset, so later callers get stale data. |
| [[Object Orgy]] | Allowing excessive access to object data |
| [[Poltergeist Anti-Pattern]] | Ephemeral controller classes that only exist to invoke other methods on classes. |
| [[Sequential Coupling]] | A class whose methods must be called in a particular order to work. |
| [[Yo-Yo Problem]] | An inheritance hierarchy so deep and fragmented that you keep jumping between classes to follow the logic. |
### Programming
| Name | Description |
| --- | --- |
| [[Accidental Complexity Anti-Pattern]] | Complexity the solution introduces that the problem doesn't require. |
| [[Action at a Distance]] | Behavior in one part of a program changes unexpectedly because of an operation somewhere else (often shared mutable state). |
| [[Boat Anchor]] | Code or components kept in the system although they serve no current purpose. |
| [[Busy Waiting]] | Continuously checking a condition in computing |
| [[Caching Failure]] | Cache used to remember failed or missing responses |
| [[Cargo Cult Programming]] | Ritual inclusion of computer code that serves no purpose |
| [[Coding by Exception]] | Adding a special-case branch for every new requirement instead of generalizing the design. |
| [[Error Hiding]] | Failing to report details of an error |
| [[Hard Coding]] | Putting data in the source code of a program |
| [[Lasagna Code]] | So many thin layers that a simple change has to pass through all of them. |
| [[Lava Flow]] | Dead or obsolete code nobody dares to remove, which hardens into the codebase. |
| [[Loop-Switch Sequence]] | A loop containing a switch that runs each case in order, encoding a plain sequence of steps as a loop. |
| [[Magic Number]] | A literal value with an important yet unexplained meaning which could be replaced with a named constant. |
| [[Magic Strings]] | Unexplained string literals used as identifiers or to drive behavior instead of named constants or enums. |
| [[Repeating Yourself]] | Duplicating the same knowledge or logic in several places (violates DRY). |
| [[Shooting the Messenger]] | Metaphor referring to blaming the carrier of unwelcome information |
| [[Shotgun Surgery]] | One change requires many small edits across many classes. |
| [[Soft Coding]] | Moving so much logic into configuration that the configuration becomes an unmaintainable program. |
| [[Spaghetti Code]] | Software source code with poor structure |
### Methodological
| Name | Description |
| --- | --- |
| [[Copy and Paste Programming]] | Duplicating code instead of creating a reusable abstraction. |
| [[Golden Hammer]] | Applying a familiar tool or technology to every problem, whether or not it fits. |
| [[Invented Here]] | Rejecting anything built in-house in favor of external products, even when in-house is the better fit. |
| [[Not Invented Here]] | Rejecting external solutions and rebuilding them in-house. |
| [[Premature Optimization]] | Optimizing before measuring, trading clarity for speed that may not matter. |
| [[Programming by Permutation]] | Changing code by trial and error until it seems to work, without understanding why. |
| [[Reinventing the Square Wheel]] | Idiomatic expression, meaning to waste effort on something that has already been achieved. |
| [[Silver Bullet Anti-Pattern]] | Expecting one tool, technique or process to solve a fundamental difficulty. |
| [[Tester-Driven Development]] | A project whose new requirements come mainly from bug reports. |
### Configuration management
| Name | Description |
| --- | --- |
| [[Dependency Hell]] | Colloquial term for software requiring many conflicting dependencies |
| [[DLL Hell]] | Colloquial term for dependency hell with DLLs (Dynamically Linked LIbraries) |
| [[Extension Conflict]] | Plug-ins or extensions that modify the same part of a host system and break each other. |
| [[JAR Hell]] | Colloquial term for dependency hell with JARs (Java Libraries) |

### Architecture anti-patterns (vault notes)
| Anti-pattern | One line |
| --- | --- |
| [[Accidental Complexity Anti-Pattern]] | Making a problem harder than it is |
| [[Analysis Paralysis]] | Deferring a decision out of fear of being wrong |
| [[Architecture by Implication Anti-Pattern]] | Coding without thinking about the architecture |
| [[Cart Before the Horse Anti-Pattern]] | Choosing an architecture before understanding the needs |
| [[Elephant Migration Anti-Pattern]] | Migrating a monolith bite by bite with no dependency view |
| [[Email-Driven Architecture Anti-Pattern]] | Architecture decisions living in email bodies |
| [[Entity Trap]] | Deriving components from entities ("Customer Manager") |
| [[Frozen Caveman Anti-Pattern]] | Deciding from past burns or outdated criteria |
| [[Infinity Architecture Anti-Pattern]] | An architecture so generic it fits nothing well |
| [[Microservice All the Things Pitfall]] | Making every function a microservice |
| [[Out-of-Context Scorecard Anti-Pattern]] | Tallying pros and cons without filtering by context |
| [[Stovepipe Architecture Anti-Pattern]] | Ill-related components bolted on ad hoc |
| [[Swarm of Gnats Anti-Pattern]] | Too many fine-grained derived events |
| [[Witch's Brew Anti-Pattern]] | A team with no unified vision mixing ideas |
| [[Anemic Events]] | Event payloads missing what consumers need |
| [[7 .NET Habits to Reconsider]] | .NET habits that became anti-patterns |
`;export{e as default};
