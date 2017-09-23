port module Main exposing (main)

import Brainloller.Lang exposing (BLOptCode, BLProgram, BLRuntime, blCmdPixel, createRuntime, getBlCmd)
import Brainloller.Pixel exposing (commandsForm, getCellMaybe, memoryTape, programCells, programDimensions, resizeProgram, setCellAt)
import Brainloller.Program exposing (progHelloWorld)
import Elem exposing (cmdBtn, cmdContentBtn, cmdTextBtn, link, mainTitle, textCopy)
import Html exposing (Html, div, input, span, text)
import Html.Attributes exposing (class, id, style, type_)
import Html.Events exposing (on, onClick)
import Json.Decode as Json
import List
import Maybe
import Ports exposing (downloadProgram, imageProcessed, interpreterHalt, interpreterTick, pauseExecution, startExecution, uploadProgram)
import Tachyons exposing (classes)
import Tachyons.Classes as Tac
import Tuple exposing (first, second)
import Util exposing (asList)


type Msg
    = NoOp
    | SetCmd BLOptCode
    | WriteCmd Int Int Bool
    | EnableWrite
    | DisableWrite
    | IncreaseSize
    | DecreaseSize
    | DownloadProgram
    | UploadProgram
    | ImageProcessed BLProgram
    | Undo
    | Redo
    | ZoomIn
    | ZoomOut
    | Reset
    | Start
    | Pause
    | Tick BLRuntime
    | Halt BLRuntime


type History a
    = Curr a
    | BackCurr (List a) a
    | BackCurrForw (List a) a (List a)


type alias Model =
    { work : History BLProgram
    , activeCmd : Maybe BLOptCode
    , runtime : BLRuntime
    , boardDimensions : ( Int, Int )
    , zoomLevel : Float
    , writeEnabled : Bool
    }


main =
    Html.program
        { init = ( initialModel, Cmd.none )
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


initialModel : Model
initialModel =
    { work = Curr progHelloWorld
    , activeCmd = Nothing
    , runtime = createRuntime Nothing
    , boardDimensions = programDimensions progHelloWorld
    , zoomLevel = 1
    , writeEnabled = False
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case ( message, model, model.activeCmd ) of
        ( NoOp, _, _ ) ->
            ( model, Cmd.none )

        ( Pause, { work, runtime }, _ ) ->
            ( model
            , pauseExecution
                { program = historyCurr work
                , runtime = runtime
                }
            )

        ( Start, { work, runtime }, _ ) ->
            ( model
            , startExecution
                { program = historyCurr work
                , runtime =
                    { runtime
                        | activeCoor = ( 0, 0 )
                        , activeCell = 0
                        , pointerDeg = 0
                        , input = Nothing
                        , output = Nothing
                        , memory = []
                    }
                }
            )

        ( Tick runtime, _, _ ) ->
            ( { model | runtime = runtime }, Cmd.none )

        ( Halt runtime, _, _ ) ->
            ( model, Cmd.none )

        ( UploadProgram, _, _ ) ->
            ( model, uploadProgram "#fileupload" )

        ( DownloadProgram, { work }, _ ) ->
            ( model, downloadProgram (historyCurr work) )

        ( ImageProcessed prog, _, _ ) ->
            ( { model
                | work = Curr prog
                , zoomLevel = 1
                , boardDimensions = programDimensions prog
              }
            , Cmd.none
            )

        ( Undo, { work }, _ ) ->
            case work of
                Curr _ ->
                    ( model, Cmd.none )

                BackCurr back curr ->
                    let
                        newCurr =
                            asList <| List.head back

                        newBack =
                            asList <| List.tail back

                        newForw =
                            [ curr ]

                        update =
                            BackCurrForw newBack newCurr newForw
                    in
                    ( { model | work = update }, Cmd.none )

                BackCurrForw back curr forw ->
                    let
                        newForw =
                            curr :: forw

                        update =
                            case back of
                                [] ->
                                    BackCurrForw [] curr forw

                                [ head ] ->
                                    BackCurrForw [] head newForw

                                head :: tail ->
                                    BackCurrForw tail head newForw
                    in
                    ( { model | work = update }, Cmd.none )

        ( Redo, { work }, _ ) ->
            case work of
                BackCurrForw back curr forw ->
                    let
                        newBack =
                            curr :: back

                        update =
                            case forw of
                                [] ->
                                    BackCurr back curr

                                [ head ] ->
                                    BackCurr newBack head

                                head :: tail ->
                                    BackCurrForw newBack head tail
                    in
                    ( { model | work = update }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        ( WriteCmd x y force, { writeEnabled, work }, Just activeCmd ) ->
            let
                program =
                    historyCurr work

                back =
                    program :: historyBack work

                pixel =
                    getBlCmd activeCmd blCmdPixel

                rewrite =
                    force || writeEnabled

                resized =
                    if rewrite then
                        resizeProgram program x y
                    else
                        program

                update =
                    case ( rewrite, getCellMaybe resized x y ) of
                        ( True, Just _ ) ->
                            BackCurr back (setCellAt resized x y pixel)

                        _ ->
                            work
            in
            ( { model | work = update }, Cmd.none )

        ( WriteCmd _ _ _, _, Nothing ) ->
            ( model, Cmd.none )

        ( SetCmd cmd, _, _ ) ->
            ( { model | activeCmd = Just cmd }, Cmd.none )

        ( EnableWrite, _, _ ) ->
            ( { model | writeEnabled = True }, Cmd.none )

        ( DisableWrite, _, _ ) ->
            ( { model | writeEnabled = False }, Cmd.none )

        ( IncreaseSize, { boardDimensions }, _ ) ->
            ( { model
                | boardDimensions =
                    ( first boardDimensions + 1, second boardDimensions + 1 )
              }
            , Cmd.none
            )

        ( DecreaseSize, { boardDimensions }, _ ) ->
            ( { model
                | boardDimensions =
                    ( first boardDimensions - 1, second boardDimensions - 1 )
              }
            , Cmd.none
            )

        ( ZoomIn, { zoomLevel }, _ ) ->
            ( { model | zoomLevel = zoomLevel + 0.1 }, Cmd.none )

        ( ZoomOut, { zoomLevel }, _ ) ->
            ( { model | zoomLevel = zoomLevel - 0.1 }, Cmd.none )

        ( Reset, _, _ ) ->
            ( { model | work = Curr [] }, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ imageProcessed ImageProcessed
        , interpreterTick Tick
        , interpreterHalt Halt
        ]


view : Model -> Html Msg
view model =
    let
        title =
            mainTitle "Brainloller"

        containerClasses =
            [ "main-container"
            , Tac.cf
            , Tac.pa3
            , Tac.pa4_ns
            ]
    in
    div [ classes containerClasses ]
        [ title
        , div
            [ class "cf" ]
            [ div
                [ class "editor-section fl w-100 w-50-l pr3-l" ]
                [ textCopy introText1 ]
            , div
                [ class "editor-section fl w-100 w-50-l pl3-l" ]
                [ textCopy introText2 ]
            ]
        , div
            []
            [ programContainer model ]
        ]


programContainer : Model -> Html Msg
programContainer model =
    let
        uploadBtn =
            cmdContentBtn
                "Upload"
                [ onClick NoOp ]
                [ input
                    [ type_ "file"
                    , id "fileupload"
                    , class "dn"
                    , on "change" (Json.succeed UploadProgram)
                    ]
                    []
                ]

        downloadBtn =
            cmdTextBtn "Download" [ onClick DownloadProgram ]

        playBtn =
            cmdTextBtn "Play" [ onClick Start ]

        pauseBtn =
            cmdTextBtn "Pause" [ onClick Pause ]

        undoBtn =
            cmdTextBtn "Undo" [ onClick Undo ]

        redoBtn =
            cmdTextBtn "Redo" [ onClick Redo ]

        growBtn =
            cmdTextBtn "Expand canvas" [ onClick IncreaseSize ]

        shrinkBtn =
            cmdTextBtn "Contract canvas" [ onClick DecreaseSize ]

        zoomInBtn =
            cmdTextBtn "Zoom in" [ onClick ZoomIn ]

        zoomOutBtn =
            cmdTextBtn "Zoom out" [ onClick ZoomOut ]

        resetBtn =
            cmdTextBtn "Clear" [ onClick Reset ]

        commands =
            [ playBtn
            , pauseBtn
            , undoBtn
            , redoBtn
            , growBtn
            , shrinkBtn
            , zoomInBtn
            , zoomOutBtn
            , resetBtn
            , uploadBtn
            , downloadBtn
            ]

        output =
            case model.runtime.output of
                Just content ->
                    div
                        [ class "program-output" ]
                        [ text content ]

                Nothing ->
                    div []
                        []
    in
    div [ class "noselect" ]
        [ div
            [ class "w-100 w-50-l" ]
            (commands ++ programCommands model)
        , div
            [ class "program-memory" ]
            (memoryTape model.runtime)
        , output
        , div
            []
            [ programOutput model ]
        ]


programOutput : Model -> Html Msg
programOutput model =
    let
        program =
            historyCurr model.work

        dim =
            programDimensions program

        width =
            2 + max (first dim) (first model.boardDimensions)

        height =
            2 + max (second dim) (second model.boardDimensions)

        write =
            \x y f -> WriteCmd x y f
    in
    div
        [ class "program-cells" ]
        [ div
            [ style [ ( "zoom", toString model.zoomLevel ) ] ]
            [ programCells width height program model.runtime write EnableWrite DisableWrite ]
        ]


programCommands : Model -> List (Html Msg)
programCommands model =
    let
        setCmd =
            \cmd -> SetCmd cmd

        activeCmd =
            Maybe.withDefault "" model.activeCmd
    in
    commandsForm setCmd activeCmd


historyCurr : History a -> a
historyCurr hist =
    case hist of
        Curr val ->
            val

        BackCurr _ val ->
            val

        BackCurrForw _ val _ ->
            val


historyBack : History a -> List a
historyBack hist =
    case hist of
        Curr _ ->
            []

        BackCurr back _ ->
            back

        BackCurrForw back _ _ ->
            back


introText1 : List (Html msg)
introText1 =
    [ textCopy
        [ link "Brainloller" "https://esolangs.org/wiki/Brainloller" True
        , text " is "
        , link "Brainfuck" "http://minond.xyz/brainfuck" False
        , text """ but represented as an image. In Brainfuck you start
            with a tape of cells ranging from 0 to, in this case,
            """
        , link "infinity" "https://en.wikipedia.org/wiki/Infinity" True
        , text """ or as much as your browser can store. This is your
            program's memory. Memory is manipulated using commands that let
            increment and decrement the value of the current cell and that
            let you shift the active cell to the left or to the right. In
            addition to the cell manipulating commands you have a loop
            construct (a command for starting a loop and a separate one for
            ending it) and input and output commands.
            """
        ]
    , textCopy
        [ text "This gives you a total of 8 commands that leave you with a "
        , link "turing complete" "https://en.wikipedia.org/wiki/Turing_completeness" True
        , text """ language, what ever that actually means in practice, but
            in theory it means you can program anything. Given that
            Brainloller code is store in a two dimensional image, the
            language provides two additional commands for rotating the
            instruction pointer direction.
            """
        ]
    ]


introText2 : List (Html msg)
introText2 =
    let
        cmdCol =
            \cmdText colorText className ->
                span
                    [ class ("cmd-label--" ++ className) ]
                    [ span
                        [ class "cmd-label-cmd" ]
                        [ text cmdText ]
                    , text " is "
                    , span
                        [ class "cmd-label-color" ]
                        [ text colorText ]
                    ]
    in
    [ textCopy
        [ text """Here's a breakdown of the commands and how Brainloller colors
            relate to different Brainfuck commands:
            """
        , cmdCol ">" "red" "shiftRight"
        , text ", "
        , cmdCol "<" "dark red" "shiftLeft"
        , text ", "
        , cmdCol "+" "green" "increment"
        , text ", "
        , cmdCol "-" "dark green" "decrement"
        , text ", "
        , cmdCol ". (period)" "blue" "ioWrite"
        , text ", "
        , cmdCol ", (comma)" "dark blue" "ioRead"
        , text ", "
        , cmdCol "[" "yellow" "loopOpen"
        , text ", "
        , cmdCol "]" "dark yellow" "loopClose"
        , text ", "
        , cmdCol "+90" "cyan" "rotateClockwise"
        , text ", "
        , cmdCol "-90" "dark cyan" "rotateCounterClockwise"
        , text "."
        ]
    , textCopy
        [ text """Below is a Brainloller program editor and interpreter.
            Automatically loaded is a "Hello, World" program which simply
            prints out the string "Hello World!".
            """
        ]
    ]
