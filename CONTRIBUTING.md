# Architecture guideline 
### types 
All types should preferably be stored in index.d.ts. While not absolutely needed, 
adding comments within type files is recommended to aid in the creation of support documentation. 
It also aids potential users by detailing what a set function does while they're coding and it's just generally convenient.

### Core Libraries
The main files in this project which is like the glue that holds this project together. 
Removing these files will likely cause this library to stop functioning

##### index.js
Common methods that should be available globally should be stored and added here. 
By globally I mean that said methods have an entry in "index.d.ts" and can include hooks that allows access to some of the modules found in the module file. 
Please avoid adding functions or code to this file that requires another library unless it's a hook for a module file. The exception is "modules/backEnd.js"

##### modules/backEnd.js
This method houses shared code between all the other modules. Specifically code that should probably not be accessed by the end user. 
All dependencies called by this module should have fall backs and fail-safes for if a set dependency cannot be obtained. 
The main example being fetch as a user may opt to use the browser's version of fetch or some other custom variant.  

### Modules 
I'd like for this project to remain mostly modular meaning that if a set component breaks, 
it's an isolated issue and doesn't result in the whole library breaking. 
This means separating out files that offer compatibility patches with specific frameworks and libraries. 

If someone who isn't using Electron and NW.js. 
Then they should in theory be able to remove the files for those modules without breaking much besides their hooks in index.js. 
Although there is a limit of one file per library/framework to avoid clutter. 
The file names of the module files should preferably reflect the library they're made to interface with. 
Using an acronym is preferred since it keeps file names short.

# Behaviour guidelines 
Respect others and don't be toxic. 
Basically keep things civil. 

# Docs
Documentation is a necessity. It keeps the project organised and makes it easier for people to use the library. 
Please update the documents accordingly/leave comments so others can do it for you when you submit new features or change the way an existing command works.

For functions a basic description of what each variable is for and what the function does is a requirement in the final docs.  
It is recommended to write an example for modules showing how to use them. The exception being internal modules.     
  
   
