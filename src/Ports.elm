port module Ports exposing (downloadProgram, imageProcessed, interpreterHalt, interpreterTick, pauseExecution, startExecution, uploadProgram)

import Brainloller.Lang exposing (BLEnvironment, BLProgram, BLRuntime)


port downloadProgram : BLProgram -> Cmd msg


port uploadProgram : String -> Cmd msg


port startExecution : BLEnvironment -> Cmd msg


port pauseExecution : BLEnvironment -> Cmd msg


port imageProcessed : (BLProgram -> msg) -> Sub msg


port interpreterTick : (BLRuntime -> msg) -> Sub msg


port interpreterHalt : (BLRuntime -> msg) -> Sub msg
